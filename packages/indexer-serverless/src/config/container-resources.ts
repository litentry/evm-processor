import type { Chain, Params } from '../types';
import getEnvVar from '../util/get-env-var';

const ecsMultiplier = 1024; // 1 vCPU or 1 GiB memory

interface ClusterConfig {
  routerCpu: number;
  routerMemory: number;
  configServerCpu: number;
  configServerMemory: number;
  shardCpu: number;
  shardMemory: number;
  routerInstances: number;
  shardInstances: number;
  configServerInstances: number;
}

const clusterConfigs: { [k: string]: ClusterConfig } = {
  bsc: {
    routerCpu: 1,
    routerMemory: 4,
    configServerCpu: 0.5,
    configServerMemory: 1,
    shardCpu: 6,
    shardMemory: 60,

    routerInstances: 3,
    shardInstances: 5,
    configServerInstances: 1,
  },
};

/**
 * Returns the number of vCPUs required for a chain
 * @param chain
 */
function getCpuUnits(chain: Chain): number {
  switch (chain) {
    case 'ethereum':
      return 4;
    default:
      return 2;
  }
}

/**
 * Returns the number of GiB of memory required for a chain
 * @param chain
 */
function getMemoryUnits(chain: Chain): number {
  switch (chain) {
    case 'ethereum':
      return 12;
    default:
      return 3;
  }
}

/**
 * Returns the number of GiB of storage required for a chain
 * @param chain
 */
function getStorageUnits(chain: Chain): number {
  switch (chain) {
    case 'ethereum':
      return 1000;
    default:
      return 100;
  }
}

export default function (stage: string, params: Params) {
  const getMongoConfiguration = (chain: string) => {
    const isSharded = getEnvVar('SHARDING_ENABLED', true) === 'true';

    if (isSharded) {
      const {
        routerCpu,
        routerMemory,
        configServerCpu,
        configServerMemory,
        shardCpu,
        shardMemory,
        configServerInstances,
        routerInstances,
        shardInstances,
      } = clusterConfigs[chain];

      const configServiceDiscovery = Array(configServerInstances)
        .fill(0)
        .reduce((config, value, index) => {
          return {
            ...config,
            [`MongoConfigServiceDiscovery${index}`]: {
              Type: 'AWS::ServiceDiscovery::Service',
              Properties: {
                Description: 'Mongo config server for archive indexer',
                DnsConfig: {
                  DnsRecords: [
                    {
                      Type: 'A',
                      TTL: 10,
                    },
                  ],
                  RoutingPolicy: 'MULTIVALUE',
                },
                Name: `config${index}.${params.mongoDnsName}`,
                NamespaceId: `\${cf:${params.clusterStackName}.ServiceRegistryNamespace}`,
              },
            },
          };
        }, {});

      const routerServiceDiscovery = Array(routerInstances)
        .fill(0)
        .reduce((config, value, index) => {
          return {
            ...config,
            [`MongoRouterServiceDiscovery${index}`]: {
              Type: 'AWS::ServiceDiscovery::Service',
              Properties: {
                Description: 'Mongo router server for archive indexer',
                DnsConfig: {
                  DnsRecords: [
                    {
                      Type: 'A',
                      TTL: 10,
                    },
                  ],
                  RoutingPolicy: 'MULTIVALUE',
                },
                Name: `router${index}.${params.mongoDnsName}`,
                NamespaceId: `\${cf:${params.clusterStackName}.ServiceRegistryNamespace}`,
              },
            },
          };
        }, {});

      const shardServiceDiscovery = Array(shardInstances)
        .fill(0)
        .reduce((config, value, index) => {
          return {
            ...config,
            [`MongoShardServiceDiscovery${index}`]: {
              Type: 'AWS::ServiceDiscovery::Service',
              Properties: {
                Description: 'Mongo shard server for archive indexer',
                DnsConfig: {
                  DnsRecords: [
                    {
                      Type: 'A',
                      TTL: 10,
                    },
                  ],
                  RoutingPolicy: 'MULTIVALUE',
                },
                Name: `shard${index}.${params.mongoDnsName}`,
                NamespaceId: `\${cf:${params.clusterStackName}.ServiceRegistryNamespace}`,
              },
            },
          };
        }, {});

      const serviceDiscovery = {
        ...configServiceDiscovery,
        ...routerServiceDiscovery,
        ...shardServiceDiscovery,
      };

      const configServers = Array(configServerInstances)
        .fill(0)
        .reduce((config, value, index) => {
          return {
            ...config,
            [`MongoTaskConfig${index}`]: {
              Type: 'AWS::ECS::TaskDefinition',
              Properties: {
                Family: `${params.mongoDnsName}-config${index}`,
                ContainerDefinitions: [
                  {
                    Name: 'mongo',
                    Environment: [
                      { Name: 'MONGODB_SHARDING_MODE', Value: 'configsvr' },
                      { Name: 'MONGODB_ROOT_PASSWORD', Value: 'password123' },
                      { Name: 'MONGODB_REPLICA_SET_MODE', Value: 'primary' },
                      {
                        Name: 'MONGODB_REPLICA_SET_NAME',
                        Value: 'config-replicaset',
                      },
                      {
                        Name: 'MONGODB_CFG_REPLICA_SET_NAME',
                        Value: 'config-replicaset',
                      },
                      { Name: 'MONGODB_REPLICA_SET_KEY', Value: 'replicakey' },
                      {
                        Name: 'MONGODB_ADVERTISED_HOSTNAME',
                        Value: `config${index}.${params.mongoDnsName}.${params.org}`,
                      },
                    ],
                    Essential: 'true',
                    Image: `373947115420.dkr.ecr.eu-west-1.amazonaws.com/litentry/mongodb:latest`,
                    LogConfiguration: {
                      LogDriver: 'awslogs',
                      Options: {
                        'awslogs-region': params.region,
                        'awslogs-stream-prefix': `${params.mongoImageVersion}/configsvr/${index}`,
                        'awslogs-group': { Ref: 'MongoLogGroup' },
                      },
                    },
                    MountPoints: [
                      {
                        ContainerPath: '/bitnami',
                        SourceVolume: `${params.ebsVolumeName}-config-${index}`,
                      },
                    ],
                    Privileged: 'false',
                    PseudoTerminal: 'false',
                  },
                ],
                Cpu: configServerCpu * ecsMultiplier,
                Memory: configServerMemory * ecsMultiplier,
                NetworkMode: 'awsvpc',
                RequiresCompatibilities: ['EC2'],
                TaskRoleArn: {
                  'Fn::Sub':
                    'arn:aws:iam::${AWS::AccountId}:role/ecs-task-sensitiveconfig-access-role',
                },
                Volumes: [
                  {
                    Name: `${params.ebsVolumeName}-config-${index}`,
                    DockerVolumeConfiguration: {
                      Autoprovision: true,
                      Driver: 'rexray/ebs',
                      DriverOpts: {
                        volumetype: 'gp3',
                        size: 10,
                      },
                      Scope: 'shared',
                    },
                  },
                ],
              },
            },
            [`MongoServiceConfig${index}`]: {
              Type: 'AWS::ECS::Service',
              Properties: {
                ServiceName: `${params.mongoDnsName}-config${index}`,
                TaskDefinition: {
                  Ref: `MongoTaskConfig${index}`,
                },
                Cluster: `\${cf:${params.clusterStackName}.EcsCluster}`,
                DesiredCount: 1,
                PlacementStrategies: [
                  {
                    Type: 'binpack',
                    Field: 'memory',
                  },
                ],
                ServiceRegistries: [
                  {
                    RegistryArn: {
                      'Fn::GetAtt': [
                        `MongoConfigServiceDiscovery${index}`,
                        'Arn',
                      ],
                    },
                  },
                ],
                NetworkConfiguration: {
                  AwsvpcConfiguration: {
                    SecurityGroups: [
                      `\${cf:${params.clusterStackName}.SecurityGroupUniversal}`,
                    ],
                    Subnets: {
                      'Fn::Split': [
                        ',',
                        `\${cf:${params.clusterStackName}.PrivateSubnets}`,
                      ],
                    },
                  },
                },
                EnableECSManagedTags: true,
                EnableExecuteCommand: true,
              },
            },
          };
        }, {});

      const routers = [0].reduce((config, value, index) => {
        return {
          ...config,
          [`MongoTaskRouter${index}`]: {
            Type: 'AWS::ECS::TaskDefinition',
            Properties: {
              Family: `${params.mongoDnsName}-router${index}`,
              ContainerDefinitions: [
                {
                  Name: 'mongo',
                  Environment: [
                    { Name: 'MONGODB_SHARDING_MODE', Value: 'mongos' },
                    { Name: 'MONGODB_ROOT_PASSWORD', Value: 'password123' },
                    {
                      Name: 'MONGODB_CFG_PRIMARY_HOST',
                      Value: `config0.${params.mongoDnsName}.${params.org}`,
                    },
                    {
                      Name: 'MONGODB_CFG_REPLICA_SET_NAME',
                      Value: 'config-replicaset',
                    },
                    { Name: 'MONGODB_REPLICA_SET_KEY', Value: 'replicakey' },
                    {
                      Name: 'MONGODB_ADVERTISED_HOSTNAME',
                      Value: `router${index}.${params.mongoDnsName}.${params.org}`,
                    },
                  ],
                  Essential: 'true',
                  Image: `373947115420.dkr.ecr.eu-west-1.amazonaws.com/litentry/mongodb:latest`,

                  LogConfiguration: {
                    LogDriver: 'awslogs',
                    Options: {
                      'awslogs-region': params.region,
                      'awslogs-stream-prefix': `${params.mongoImageVersion}/router/${index}`,
                      'awslogs-group': { Ref: 'MongoLogGroup' },
                    },
                  },
                  Privileged: 'false',
                  PseudoTerminal: 'false',
                },
              ],
              Cpu: routerCpu * ecsMultiplier,
              Memory: routerMemory * ecsMultiplier,
              NetworkMode: 'awsvpc',
              RequiresCompatibilities: ['EC2'],
              TaskRoleArn: {
                'Fn::Sub':
                  'arn:aws:iam::${AWS::AccountId}:role/ecs-task-sensitiveconfig-access-role',
              },
            },
          },
          [`MongoServiceRouter${index}`]: {
            Type: 'AWS::ECS::Service',
            Properties: {
              ServiceName: `${params.mongoDnsName}-router${index}`,
              TaskDefinition: {
                Ref: `MongoTaskRouter${index}`,
              },
              Cluster: `\${cf:${params.clusterStackName}.EcsCluster}`,
              DesiredCount: routerInstances,
              PlacementStrategies: [
                {
                  Type: 'binpack',
                  Field: 'memory',
                },
              ],
              ServiceRegistries: [
                {
                  RegistryArn: {
                    'Fn::GetAtt': [
                      `MongoRouterServiceDiscovery${index}`,
                      'Arn',
                    ],
                  },
                },
              ],
              NetworkConfiguration: {
                AwsvpcConfiguration: {
                  SecurityGroups: [
                    `\${cf:${params.clusterStackName}.SecurityGroupUniversal}`,
                  ],
                  Subnets: {
                    'Fn::Split': [
                      ',',
                      `\${cf:${params.clusterStackName}.PrivateSubnets}`,
                    ],
                  },
                },
              },
              EnableECSManagedTags: true,
              EnableExecuteCommand: true,
            },
          },
        };
      }, {});

      const shards = Array(shardInstances)
        .fill(0)
        .reduce((config, value, index) => {
          return {
            ...config,
            [`MongoTaskShard${index}`]: {
              Type: 'AWS::ECS::TaskDefinition',
              Properties: {
                Family: `${params.mongoDnsName}-shard${index}`,
                ContainerDefinitions: [
                  {
                    Name: 'mongo',
                    Environment: [
                      { Name: 'MONGODB_SHARDING_MODE', Value: 'shardsvr' },
                      { Name: 'MONGODB_ROOT_PASSWORD', Value: 'password123' },
                      {
                        Name: 'MONGODB_MONGOS_HOST',
                        Value: `router0.${params.mongoDnsName}.${params.org}`,
                      },
                      { Name: 'MONGODB_REPLICA_SET_MODE', Value: `primary` },
                      {
                        Name: 'MONGODB_REPLICA_SET_NAME',
                        Value: `shard${index}`,
                      },
                      { Name: 'MONGODB_REPLICA_SET_KEY', Value: 'replicakey' },
                      {
                        Name: 'MONGODB_EXTRA_FLAGS',
                        Value: `--wiredTigerCacheSizeGB=${Math.floor(
                          shardMemory / 2,
                        )} --slowOpSampleRate 0.001 --quiet`,
                      },
                      {
                        Name: 'MONGODB_ADVERTISED_HOSTNAME',
                        Value: `shard${index}.${params.mongoDnsName}.${params.org}`,
                      },
                    ],
                    Essential: 'true',
                    Image: `373947115420.dkr.ecr.eu-west-1.amazonaws.com/litentry/mongodb:latest`,
                    LogConfiguration: {
                      LogDriver: 'awslogs',
                      Options: {
                        'awslogs-region': params.region,
                        'awslogs-stream-prefix': `${params.mongoImageVersion}/shard/${index}`,
                        'awslogs-group': { Ref: 'MongoLogGroup' },
                      },
                    },
                    MountPoints: [
                      {
                        ContainerPath: '/bitnami',
                        SourceVolume: `${params.ebsVolumeName}-shard-${index}`,
                      },
                    ],
                    Privileged: 'false',
                    PseudoTerminal: 'false',
                  },
                ],
                Cpu: shardCpu * ecsMultiplier,
                Memory: shardMemory * ecsMultiplier,
                NetworkMode: 'awsvpc',
                RequiresCompatibilities: ['EC2'],
                TaskRoleArn: {
                  'Fn::Sub':
                    'arn:aws:iam::${AWS::AccountId}:role/ecs-task-sensitiveconfig-access-role',
                },
                Volumes: [
                  {
                    Name: `${params.ebsVolumeName}-shard-${index}`,
                    DockerVolumeConfiguration: {
                      Autoprovision: true,
                      Driver: 'rexray/ebs',
                      DriverOpts: {
                        volumetype: 'gp3',
                        size: 100,
                      },
                      Scope: 'shared',
                    },
                  },
                ],
              },
            },
            [`MongoServiceShard${index}`]: {
              Type: 'AWS::ECS::Service',
              Properties: {
                ServiceName: `${params.mongoDnsName}-shard${index}`,
                TaskDefinition: {
                  Ref: `MongoTaskShard${index}`,
                },
                Cluster: `\${cf:${params.clusterStackName}.EcsCluster}`,
                DesiredCount: 1,
                PlacementStrategies: [
                  {
                    Type: 'binpack',
                    Field: 'memory',
                  },
                ],
                ServiceRegistries: [
                  {
                    RegistryArn: {
                      'Fn::GetAtt': [
                        `MongoShardServiceDiscovery${index}`,
                        'Arn',
                      ],
                    },
                  },
                ],
                NetworkConfiguration: {
                  AwsvpcConfiguration: {
                    SecurityGroups: [
                      `\${cf:${params.clusterStackName}.SecurityGroupUniversal}`,
                    ],
                    Subnets: {
                      'Fn::Split': [
                        ',',
                        `\${cf:${params.clusterStackName}.PrivateSubnets}`,
                      ],
                    },
                  },
                },
                EnableECSManagedTags: true,
                EnableExecuteCommand: true,
              },
            },
          };
        }, {});

      return {
        ...serviceDiscovery,
        ...configServers,
        ...routers,
        ...shards,
      };
    } else {
      return {
        MongoServiceDiscovery: {
          Type: 'AWS::ServiceDiscovery::Service',
          Properties: {
            Description: 'Mongo server for archive indexer',
            DnsConfig: {
              DnsRecords: [
                {
                  Type: 'A',
                  TTL: 10,
                },
              ],
              RoutingPolicy: 'WEIGHTED',
            },
            Name: params.mongoDnsName,
            NamespaceId: `\${cf:${params.clusterStackName}.ServiceRegistryNamespace}`,
          },
        },
        MongoTask: {
          Type: 'AWS::ECS::TaskDefinition',
          Properties: {
            Family: params.mongoDnsName,
            ContainerDefinitions: [
              {
                Name: 'mongo',
                Command: [
                  'mongod',
                  '--wiredTigerCacheSizeGB',
                  `${getMemoryUnits(params.chain) / 2}`,
                ],
                Essential: 'true',
                Image: `mongo:${params.mongoImageVersion}`,
                LogConfiguration: {
                  LogDriver: 'awslogs',
                  Options: {
                    'awslogs-region': params.region,
                    'awslogs-stream-prefix': `${params.mongoImageVersion}`,
                    'awslogs-group': { Ref: 'MongoLogGroup' },
                  },
                },
                MountPoints: [
                  {
                    ContainerPath: '/data/db',
                    SourceVolume: params.ebsVolumeName,
                  },
                ],
                Privileged: 'false',
                PseudoTerminal: 'false',
              },
            ],
            Cpu: getCpuUnits(<Chain>params.chain) * ecsMultiplier,
            Memory: getMemoryUnits(<Chain>params.chain) * ecsMultiplier,
            NetworkMode: 'awsvpc',
            RequiresCompatibilities: ['EC2'],
            TaskRoleArn: {
              'Fn::Sub':
                'arn:aws:iam::${AWS::AccountId}:role/ecs-task-sensitiveconfig-access-role',
            },
            Volumes: [
              {
                Name: params.ebsVolumeName,
                DockerVolumeConfiguration: {
                  Autoprovision: true,
                  Driver: 'rexray/ebs',
                  DriverOpts: {
                    volumetype: 'gp3',
                    size: getStorageUnits(<Chain>params.chain),
                  },
                  Scope: 'shared',
                },
              },
            ],
          },
        },
        MongoService: {
          Type: 'AWS::ECS::Service',
          Properties: {
            ServiceName: params.mongoDnsName,
            TaskDefinition: {
              Ref: 'MongoTask',
            },
            Cluster: `\${cf:${params.clusterStackName}.EcsCluster}`,
            DesiredCount: 1,
            PlacementStrategies: [
              {
                Type: 'binpack',
                Field: 'memory',
              },
            ],
            ServiceRegistries: [
              {
                RegistryArn: {
                  'Fn::GetAtt': ['MongoServiceDiscovery', 'Arn'],
                },
              },
            ],
            NetworkConfiguration: {
              AwsvpcConfiguration: {
                SecurityGroups: [
                  `\${cf:${params.clusterStackName}.SecurityGroupUniversal}`,
                ],
                Subnets: {
                  'Fn::Split': [
                    ',',
                    `\${cf:${params.clusterStackName}.PrivateSubnets}`,
                  ],
                },
              },
            },
            EnableECSManagedTags: true,
            EnableExecuteCommand: true,
          },
        },
      };
    }
  };

  if (stage === 'production') {
    return {
      Resources: {
        MongoLogGroup: {
          Type: 'AWS::Logs::LogGroup',
          Properties: {
            LogGroupName: params.mongoDnsName,
            RetentionInDays: 1,
          },
        },
        ...getMongoConfiguration(params.chain),
      },
    };
  }
  return {};
}

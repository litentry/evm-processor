import type { Params } from '../types';
import getEnvVar from '../util/get-env-var';
import getSpecifiedOutputs from '../util/get-specified-outputs';

const ecsMultiplier = 1024; // 1 vCPU or 1 GiB memory

interface ECSCapacityGroup {
  groupName: string;
  instanceType: string;
  cpu: number;
  memory: number;
  min: number;
  max: number;
  weight: number;
}

interface BaseConfig {
  cpu: number;
  memory: number;
}

interface ClusterConfig {
  router: BaseConfig;
  configServer: BaseConfig;
  shard: BaseConfig;

  routerInstances: number;
  shardInstances: number;
  configServerInstances: number;

  totalStorage: number;
}

interface StandaloneConfig extends BaseConfig {
  totalStorage: number;
}

const clusterConfigs: { [k: string]: { [k: string]: Partial<ClusterConfig> } } =
  {
    chainDefaults: {
      indexerDefaults: {
        router: {
          cpu: 1,
          memory: 4,
        },
        configServer: {
          cpu: 0.5,
          memory: 1,
        },
        shard: {
          cpu: 4,
          memory: 15,
        },
        routerInstances: 1,
        shardInstances: 3,
        configServerInstances: 1,
        totalStorage: 1500,
      },
    },
    bsc: {
      indexerDefaults: {
        routerInstances: 3,
        shardInstances: 6,
        configServerInstances: 1,
      },
      archive: {
        shard: {
          cpu: 8,
          memory: 15,
        },
        totalStorage: 4000,
      },
    },
  };

const standaloneConfigs: {
  [k: string]: { [k: string]: Partial<StandaloneConfig> };
} = {
  chainDefaults: {
    indexerDefaults: {
      cpu: 1,
      memory: 8,
      totalStorage: 100,
    },
  },
  ethereum: {
    indexerDefaults: {
      cpu: 6,
      memory: 32,
      totalStorage: 1500,
    },
    archive: {
      cpu: 6,
      memory: 32,
      totalStorage: 1500,
    },
    contracts: {
      cpu: 1,
      memory: 4,
      totalStorage: 100,
    },
    'token-activity': {
      cpu: 6,
      memory: 32,
      totalStorage: 1500,
    },
  },
};

function getClusterConfig(chain: string, indexer: string) {
  return {
    ...clusterConfigs.chainDefaults.indexerDefaults,
    ...(clusterConfigs[chain] || {}).indexerDefaults,
    ...(clusterConfigs[chain] || {})[indexer],
  };
}

function getStandaloneConfig(chain: string, indexer: string) {
  return {
    ...standaloneConfigs.chainDefaults.indexerDefaults,
    ...(standaloneConfigs[chain] || {}).indexerDefaults,
    ...(standaloneConfigs[chain] || {})[indexer],
  };
}

export default async function (stage: string, params: Params) {
  async function getCapacityProvider(
    name: string,
    config: BaseConfig,
  ): Promise<string> {
    const { capacityProviders, cluster } = await getSpecifiedOutputs<{
      capacityProviders: string;
      cluster: string;
    }>(params.clusterStackName, {
      capacityProviders: 'CapacityProviders',
      cluster: 'EcsCluster',
    });

    const ecsCapacityGroups: ECSCapacityGroup[] = (<ECSCapacityGroup[]>(
      JSON.parse(capacityProviders)
    )).sort((a, b) => {
      if (a.cpu < b.cpu) {
        return -1;
      } else if (a.cpu > b.cpu) {
        return 1;
      }

      if (a.memory < b.memory) {
        return -1;
      } else if (a.memory > b.memory) {
        return 1;
      }
      return 0;
    });
    let maxProviderCpu = 0;
    let maxProviderMemory = 0;
    for (const capacityGroup of ecsCapacityGroups) {
      maxProviderCpu = Math.max(
        maxProviderCpu,
        capacityGroup.cpu * ecsMultiplier,
      );
      maxProviderMemory = Math.max(
        maxProviderMemory,
        capacityGroup.memory * ecsMultiplier,
      );
      if (
        capacityGroup.cpu >= config.cpu * ecsMultiplier &&
        capacityGroup.memory >= config.memory * ecsMultiplier
      ) {
        return `${cluster}-${capacityGroup.groupName}`;
      }
    }
    throw new Error(
      `Unable to map service ${name} to a currently enabled capacity provider (requested cpu=${
        config.cpu * ecsMultiplier
      }, memory=${
        config.memory * ecsMultiplier
      } vs. max cpu=${maxProviderCpu}, memory=${maxProviderMemory})`,
    );
  }

  async function getMongoConfiguration(chain: string, indexer: string) {
    const isSharded = getEnvVar('SHARDING_ENABLED', true) === 'true';

    if (isSharded) {
      const {
        router,
        shard,
        configServer,
        configServerInstances,
        routerInstances,
        shardInstances,
        totalStorage,
      } = <ClusterConfig>getClusterConfig(chain, indexer);

      const shardCapacityProvider = await getCapacityProvider(
        'shard',
        <BaseConfig>getClusterConfig(chain, indexer).shard,
      );
      const routerCapacityProvider = await getCapacityProvider(
        'router',
        <BaseConfig>getClusterConfig(chain, indexer).router,
      );
      const configServerCapacityProvider = await getCapacityProvider(
        'configServer',
        <BaseConfig>getClusterConfig(chain, indexer).configServer,
      );

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
            [`MongoPrimaryRouterServiceDiscovery${index}`]: {
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
                Name: `router-primary.${params.mongoDnsName}`,
                NamespaceId: `\${cf:${params.clusterStackName}.ServiceRegistryNamespace}`,
              },
            },
            [`MongoAllRouterServiceDiscovery${index}`]: {
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
                Name: `routers.${params.mongoDnsName}`,
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
                Cpu: configServer.cpu * ecsMultiplier,
                Memory: configServer.memory * ecsMultiplier,
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
                DeploymentConfiguration: {
                  MaximumPercent: 100,
                  MinimumHealthyPercent: 0,
                },
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
                CapacityProviderStrategy: [
                  {
                    Base: 0,
                    CapacityProvider: configServerCapacityProvider,
                    Weight: 1,
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
          [`MongoTaskRouter`]: {
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
                      Value: `router-primary.${params.mongoDnsName}.${params.org}`,
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
              Cpu: router.cpu * ecsMultiplier,
              Memory: router.memory * ecsMultiplier,
              NetworkMode: 'awsvpc',
              RequiresCompatibilities: ['EC2'],
              TaskRoleArn: {
                'Fn::Sub':
                  'arn:aws:iam::${AWS::AccountId}:role/ecs-task-sensitiveconfig-access-role',
              },
            },
          },
          [`MongoServiceRouterPrimary`]: {
            Type: 'AWS::ECS::Service',
            Properties: {
              ServiceName: `${params.mongoDnsName}-router-primary`,
              DeploymentConfiguration: {
                MaximumPercent: 100,
                MinimumHealthyPercent: 0,
              },
              TaskDefinition: {
                Ref: `MongoTaskRouter`,
              },
              Cluster: `\${cf:${params.clusterStackName}.EcsCluster}`,
              DesiredCount: 1,
              PlacementStrategies: [
                {
                  Type: 'binpack',
                  Field: 'memory',
                },
              ],
              CapacityProviderStrategy: [
                {
                  Base: 0,
                  CapacityProvider: routerCapacityProvider,
                  Weight: 1,
                },
              ],
              ServiceRegistries: [
                {
                  RegistryArn: {
                    'Fn::GetAtt': [
                      `MongoPrimaryRouterServiceDiscovery${index}`,
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
          [`MongoServiceRouterSecondary`]: {
            Type: 'AWS::ECS::Service',
            Properties: {
              ServiceName: `${params.mongoDnsName}-router-secondary`,
              DeploymentConfiguration: {
                MaximumPercent: 100,
                MinimumHealthyPercent: 0,
              },
              TaskDefinition: {
                Ref: `MongoTaskRouter`,
              },
              Cluster: `\${cf:${params.clusterStackName}.EcsCluster}`,
              DesiredCount: routerInstances,
              PlacementStrategies: [
                {
                  Type: 'binpack',
                  Field: 'memory',
                },
              ],
              CapacityProviderStrategy: [
                {
                  Base: 0,
                  CapacityProvider: routerCapacityProvider,
                  Weight: 1,
                },
              ],
              ServiceRegistries: [
                {
                  RegistryArn: {
                    'Fn::GetAtt': [
                      `MongoAllRouterServiceDiscovery${index}`,
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
                        Value: `router-primary.${params.mongoDnsName}.${params.org}`,
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
                          shard.memory / 2,
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
                Cpu: shard.cpu * ecsMultiplier,
                Memory: shard.memory * ecsMultiplier,
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
                        size: Math.ceil(totalStorage / shardInstances),
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
                DeploymentConfiguration: {
                  MaximumPercent: 100,
                  MinimumHealthyPercent: 0,
                },
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
                CapacityProviderStrategy: [
                  {
                    Base: 0,
                    CapacityProvider: shardCapacityProvider,
                    Weight: 1,
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
      const { cpu, memory, totalStorage } = <StandaloneConfig>(
        getStandaloneConfig(chain, indexer)
      );

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
                  `${memory / 2}`,
                  `--slowOpSampleRate`,
                  `0.001`,
                  `--quiet`,
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
            Cpu: cpu * ecsMultiplier,
            Memory: memory * ecsMultiplier,
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
                    size: totalStorage,
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
            DeploymentConfiguration: {
              MaximumPercent: 100,
              MinimumHealthyPercent: 0,
            },
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
            CapacityProviderStrategy: [
              {
                Base: 0,
                CapacityProvider: await getCapacityProvider(
                  'configServer',
                  <StandaloneConfig>getStandaloneConfig(chain, indexer),
                ),
                Weight: 1,
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
  }

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
        ...(await getMongoConfiguration(params.chain, params.indexer)),
      },
    };
  }
  return {};
}

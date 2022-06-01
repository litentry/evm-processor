import type { Chain, Params } from '../types';
import { chain } from 'lodash';

function getCpuUnits(chain: Chain): number {
  const multiplier = 1024; // 1 vCPU (core)
  switch (chain) {
    case 'ethereum':
      return 6 * multiplier;
    default:
      return 2 * multiplier;
  }
}
function getMemoryUnits(chain: Chain): number {
  const multiplier = 1024; // 1 GiB
  switch (chain) {
    case 'ethereum':
      return 12 * multiplier;
    default:
      return 3 * multiplier;
  }
}
function getStorage(chain: Chain): number {
  switch (chain) {
    case 'ethereum':
      return 1000;
    default:
      return 100;
  }
}

export default function (stage: string, params: Params) {

  if (stage === 'production') {
    return {
      Resources: {
        MongoLogGroup: {
          Type: 'AWS::Logs::LogGroup',
          Properties: {
            LogGroupName: params.mongoDnsName,
            RetentionInDays: 5,
          },
        },
        MongoServiceDiscovery: {
          Type: 'AWS::ServiceDiscovery::Service',
          Properties: {
            Description: 'Mongo servers for archive indexer',
            DnsConfig: {
              DnsRecords: [
                {
                  Type: 'A',
                  TTL: 60,
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
                Essential: 'true',
                Image: `mongo:${params.mongoImageVersion}`,
                LogConfiguration: {
                  LogDriver: 'awslogs',
                  Options: {
                    'awslogs-region': params.region,
                    'awslogs-stream-prefix': params.mongoImageVersion,
                    'awslogs-group': { Ref: 'MongoLogGroup' },
                  },
                },
                MountPoints: [
                  {
                    ContainerPath: '/data/db',
                    SourceVolume: params.ebsVolumeName,
                  },
                ],
                PortMappings: [
                  {
                    ContainerPort: 27017,
                    HostPort: 27017,
                    Protocol: 'tcp',
                  },
                ],
                Privileged: 'false',
                PseudoTerminal: 'false',
              },
            ],
            Cpu: getCpuUnits(<Chain>params.chain),
            Memory: getMemoryUnits(<Chain>params.chain),
            NetworkMode: 'awsvpc',
            RequiresCompatibilities: ['EC2'],
            Volumes: [
              {
                Name: params.ebsVolumeName,
                DockerVolumeConfiguration: {
                  Autoprovision: true,
                  Driver: 'rexray/ebs',
                  DriverOpts: {
                    volumetype: 'gp3',
                    size: getStorage(<Chain>params.chain),
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
            EnableEcsManagedTags: true,
            PlacementStrategies: [{
              Type: 'binpack',
              Field: 'memory'
            }],
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
          },
        },
      },
    };
  }
  return {};
}

import type { Params } from "../../serverless";

export default function (stage: string, params: Params) {
  if (stage === 'production') {
    return {
      Resources: {
        MongoLogGroup: {
          Type: 'AWS::Logs::LogGroup',
          Properties: {
            LogGroupName: params.mongoDnsName
          }
        },
        MongoServiceDiscovery: {
          Type: "AWS::ServiceDiscovery::Service",
          Properties: {
            Description: 'Mongo servers for archive indexer',
            DnsConfig: {
              DnsRecords: [
                {
                  Type: "A",
                  TTL: 60
                },
              ],
              RoutingPolicy: "WEIGHTED",
            },
            Name: params.mongoDnsName,
            NamespaceId: `\${cf:${params.clusterStackName}.ServiceRegistryNamespace}`,
          }
        },
        MongoTask: {
          Type: 'AWS::ECS::TaskDefinition',
          Properties: {
            Family: params.mongoDnsName,
            ContainerDefinitions: [
              {
                Name: 'mongo',
                Essential: "true",
                Image: `mongo:${params.mongoImageVersion}`,
                LogConfiguration: {
                  LogDriver: 'awslogs',
                  Options: {
                    'awslogs-region': params.region,
                    'awslogs-stream-prefix': params.mongoImageVersion,
                    'awslogs-group': { Ref: 'MongoLogGroup' }
                  }
                },
                MountPoints: [
                  {
                    ContainerPath: '/data/db',
                    SourceVolume: params.ebsVolumeName
                  }
                ],
                PortMappings: [{
                  ContainerPort: 27017,
                  HostPort: 27017,
                  Protocol: 'tcp',
                }],
                Privileged: "false",
                PseudoTerminal: "false",
              }
            ],
            Cpu: 2048,
            Memory: 3000,
            NetworkMode: 'awsvpc',
            RequiresCompatibilities: [
              'EC2'
            ],
            Volumes: [
              {
                Name: params.ebsVolumeName,
                DockerVolumeConfiguration: {
                  Autoprovision: true,
                  Driver: 'rexray/ebs',
                  DriverOpts: {
                    volumetype: "gp3",
                    size: 100
                  },
                  Scope: 'shared'
                }
              }
            ]
          }
        },
        MongoService: {
          Type: 'AWS::ECS::Service',
          Properties: {
            ServiceName: params.mongoDnsName,
            TaskDefinition: {
              Ref: 'MongoTask'
            },
            Cluster: `\${cf:${params.clusterStackName}.EcsCluster}`,
            DesiredCount: 1,
            EnableEcsManagedTags: true,
            ServiceRegistries: [{
              RegistryArn: {
                "Fn::GetAtt": ["MongoServiceDiscovery", "Arn"]
              }
            }],
            NetworkConfiguration: {
              AwsvpcConfiguration: {
                SecurityGroups: [`\${cf:${params.clusterStackName}.SecurityGroupUniversal}`],
                Subnets: {
                  "Fn::Split": [
                    ',',
                    `\${cf:${params.clusterStackName}.PrivateSubnets}`
                  ]
                }
              }
            },
          }
        }
      }
    };
  }
  return {};
}

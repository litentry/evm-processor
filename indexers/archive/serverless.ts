import producer from '@functions/producer';
import worker from '@functions/worker';
import type { AWS } from '@serverless/typescript';
import containerResources from "./serverless/config/container-resources";
import getInfraStack from "./serverless/util/get-infra-stack";
import stageConfigFactory from './serverless/config/stage-config';
import {getContext} from "./serverless/util/context";

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);

export type Params = {
  org: string;
  clusterStackName: string;
  mongoImageVersion: string;
  region: AWS['provider']['region'];
  mongoDnsName: string;
  ebsVolumeName: string;
}

const serviceName = 'archive-indexer';

const params: Params = {
  org: 'litentry',
  clusterStackName: 'graph-aws-infrastructure-dev',
  mongoImageVersion: '5.0.8',
  region: 'eu-west-1',
  mongoDnsName: `${serviceName}-mongo`,
  ebsVolumeName: `${serviceName}-mongo-ebs`,
}

const getStageEnv = (stage: string) => {
  if (stage === 'production') {
    return {
      MONGO_URI: `mongodb://${params.mongoDnsName}.${params.org}:27017/archive`
    };
  }
  return {
    MONGO_URI: `mongodb://mongodb:27017/archive`
  }
}

const vpcOptions = async (stage: string) => {
  if (stage === 'production') {
    const infraStack = await getInfraStack(params.clusterStackName);
    const securityGroupIds = infraStack.Outputs
      .filter((output) =>
        ['SecurityGroupUniversal', 'SecurityGroupOutboundUniversal'].includes(output.OutputKey)
      )
      .map((output) => {
        return output.OutputValue
      });

    const subnetIds = infraStack.Outputs
      .filter((output) =>
        output.OutputKey === 'PrivateSubnets'
      )
      .reduce((value, output) => {
        return output.OutputValue.split(',')
      }, <string[]>[]);

    return {
      vpc: {
        securityGroupIds,
        subnetIds
      }
    };
  }
  return {};
}

const getConfig = async () => {
  const instance = await getContext();

  const serverlessConfiguration: AWS = {
    service: serviceName,
    frameworkVersion: '3',
    plugins: ['serverless-esbuild', 'serverless-localstack'],
    provider: {
        name: 'aws',
        runtime: 'nodejs14.x',
        region: params.region,
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
            MONGO_URI: `mongodb://${params.mongoDnsName}.${params.org}:27017/archive`
        },
        iam: {
            role: {
                statements: [
                    {
                        Effect: 'Allow',
                        Action: [
                            'sqs:SendMessage', 'sqs:GetQueueAttributes', 'sqs:GetQueueUrl', 'sqs:ListQueues', 'sqs:DeleteMessage', 'sqs:ReceiveMessage'
                        ],
                        Resource: [
                            {
                                'Fn::GetAtt': [
                                    'JobQueue', 'Arn'
                                ]
                            }
                        ]

                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            's3:GetObject', 's3:PutObject'
                        ],
                        Resource: [
                            `arn:aws:s3:::${stageConfig.getProducerBucketName()}/*`
                        ]

                    }
                ]
            }
          ]
        }
      },
      ...(await vpcOptions(instance.options.stage))
    },
    resources: {
      Resources: {
        JobQueue: {
          Type: 'AWS::SQS::Queue',
          Properties: {
            QueueName: 'JobQueue',
            VisibilityTimeout: 60
          }
        },
        ...containerResources(params).Resources
      }
    },
    functions: {
      producer,
      worker
    },
    package: { individually: true },
    custom: {
      localstack: {
        stages: ['local'],
      },
      esbuild: {
        bundle: true,
        minify: false,
        sourcemap: true,
        exclude: ['aws-sdk'],
        target: 'node14',
        define: { 'require.resolve': undefined },
        platform: 'node',
        concurrency: 10,
      },
    },
  };

  return serverlessConfiguration;
}

module.exports = new Promise((res) => res(getConfig()));

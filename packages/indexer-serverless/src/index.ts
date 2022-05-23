import type { AWS } from '@serverless/typescript';
import { Config, Params } from './types';
import containerResources from './config/container-resources';
import producer from './functions/producer';
import worker from './functions/worker';
import query from './functions/query';
import getInfraStack from './util/get-infra-stack';
import { getContext } from './util/context';

const vpcOptions = async (stage: string, clusterStackName: string) => {
  if (stage === 'production') {
    const infraStack = await getInfraStack(clusterStackName);
    const securityGroupIds = infraStack
      .Outputs!.filter((output) =>
        ['SecurityGroupUniversal', 'SecurityGroupOutboundUniversal'].includes(
          output.OutputKey!
        )
      )
      .map((output) => {
        return output.OutputValue!;
      });

    const subnetIds = infraStack
      .Outputs!.find((output) => output.OutputKey === 'PrivateSubnets')!
      .OutputValue!.split(',');

    return {
      vpc: {
        securityGroupIds,
        subnetIds,
      },
    };
  }
  return {};
};

const augmentEnvVars = async (stage: string, params: Params): Promise<void> => {
  if (stage === 'production') {
    const infraStack = await getInfraStack(params.clusterStackName);
    if (!process.env.MONGO_URI) {
      const serviceDiscoveryDomain = infraStack.Outputs!.find(
        (output) => output.OutputKey === 'RealmDNSZone'
      )!.OutputValue!;

      process.env.MONGO_URI = `mongodb://${params.mongoDnsName}.${serviceDiscoveryDomain}:27017/evm-archive`;
    }
  }
};

const getConfig = async (config: Config) => {
  const params: Params = {
    org: 'litentry',
    clusterStackName: 'graph-aws-infrastructure-dev',
    mongoImageVersion: '5.0.8',
    region: 'eu-west-1',
    mongoDnsName: `${config.serviceName}-mongo`,
    ebsVolumeName: `${config.serviceName}-mongo-ebs`,
  };

  const context = getContext();
  await augmentEnvVars(context.options.stage, params);

  const serverlessConfiguration: AWS = {
    service: config.serviceName,
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
      },
      iam: {
        role: {
          statements: [
            {
              Effect: 'Allow',
              Action: [
                'sqs:SendMessage',
                'sqs:GetQueueAttributes',
                'sqs:GetQueueUrl',
                'sqs:ListQueues',
                'sqs:DeleteMessage',
                'sqs:ReceiveMessage',
              ],
              Resource: [
                {
                  'Fn::GetAtt': ['JobQueue', 'Arn'],
                },
              ],
            },
          ],
        },
      },
      ...(await vpcOptions(context.options.stage, params.clusterStackName)),
    },
    resources: {
      Resources: {
        JobQueue: {
          Type: 'AWS::SQS::Queue',
          Properties: {
            QueueName: 'JobQueue',
            VisibilityTimeout: 60,
          },
        },
        ...containerResources(context.options.stage, params).Resources,
      },
    },
    functions: {
      producer: producer(config),
      worker: worker(config),
      query,
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
};

export default (config: Config) => new Promise((res) => res(getConfig(config)));

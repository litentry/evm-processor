import type { AWS } from '@serverless/typescript';
import containerResources from './config/container-resources';
import lastIndexedBlock from './functions/last-indexed-block';
import producer from './functions/producer';
import query from './functions/query';
import worker from './functions/worker';
import { Config, Params } from './types';
import { getContext } from './util/context';
import getInfraStack from './util/get-infra-stack';

const vpcOptions = async (stage: string, clusterStackName: string) => {
  if (stage !== 'local') {
    const infraStack = await getInfraStack(clusterStackName);
    const securityGroupIds = infraStack
      .Outputs!.filter((output) =>
        ['SecurityGroupUniversal', 'SecurityGroupOutboundUniversal'].includes(
          output.OutputKey!,
        ),
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
        (output) => output.OutputKey === 'RealmDNSZone',
      )!.OutputValue!;

      process.env.MONGO_URI = `mongodb://${params.mongoDnsName}.${serviceDiscoveryDomain}:27017/db`;
    }
  }
};

const getConfig = async (config: Config) => {
  const params: Params = {
    org: 'litentry',
    clusterStackName: 'graph-aws-infrastructure-dev',
    mongoImageVersion: '5.0.8',
    region: 'eu-west-1',
    mongoDnsName: `${config.chain}-${config.serviceName}-mongo-${config.version}`,
    ebsVolumeName: `${config.chain}-${config.serviceName}-mongo-ebs-${config.version}`,
    jobQueueName: `${config.chain}-${config.serviceName}-JobQueue-${config.version}`,
    maxWorkers: config.maxWorkers,
    chain: config.chain,
    version: config.version,
    indexer: config.serviceName,
  };

  const context = getContext();
  await augmentEnvVars(context.options.stage, params);

  const serverlessConfiguration: AWS = {
    service: `${config.chain}-${config.serviceName}-${config.version}`,
    frameworkVersion: '3',
    plugins: [
      'serverless-esbuild',
      'serverless-localstack',
      'serverless-domain-manager',
    ],
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
            {
              Effect: 'Allow',
              Action: ['sqs:GetQueueAttributes'],
              Resource: [
                {
                  'Fn::GetAtt': ['JobQueueDLQ', 'Arn'],
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
            QueueName: `${params.jobQueueName}.fifo`,
            VisibilityTimeout: 120,
            FifoQueue: true,
            FifoThroughputLimit: 'perMessageGroupId',
            DeduplicationScope: 'messageGroup',
            MessageRetentionPeriod: 1209600,
            ContentBasedDeduplication: true,
            RedrivePolicy: {
              deadLetterTargetArn: {
                'Fn::GetAtt': ['JobQueueDLQ', 'Arn'],
              },
              maxReceiveCount: 10,
            },
          },
        },
        JobQueueDLQ: {
          Type: 'AWS::SQS::Queue',
          Properties: {
            QueueName: `${params.jobQueueName}-dlq.fifo`,
            FifoQueue: true,
          },
        },
        ...(await containerResources(context.options.stage, params)).Resources,
      },
    },
    functions: {
      producer: producer(config, params),
      worker: worker(config, params),
      lastIndexedBlock: lastIndexedBlock(config, params),
      query: query(config, params),
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
      customDomain: {
        domainName: `${params.chain}-${params.indexer}-${params.version}.graph.eng.litentry.io`,
        createRoute53Record: true,
        endpointType: 'regional',
        securityPolicy: 'tls_1_2',
        apiType: 'rest',
        autoDomain: true,
      },
    },
  };

  return serverlessConfiguration;
};

export default (config: Config) => new Promise((res) => res(getConfig(config)));

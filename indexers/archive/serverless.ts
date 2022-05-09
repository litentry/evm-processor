import producer from '@functions/producer';
import worker from '@functions/worker';
import query from '@functions/query';
import type { AWS } from '@serverless/typescript';
import stageConfigFactory from './serverless/config/stage-config';
import {getContext} from "./serverless/util/context";

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);


const serverlessConfiguration: AWS = {
    service: 'archive-indexer',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild', 'serverless-localstack'],
    provider: {
        name: 'aws',
        runtime: 'nodejs14.x',
        region: 'eu-west-1',
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
        }
    },
    resources: {
        Resources: {
            JobQueue: {
                Type: 'AWS::SQS::Queue',
                Properties: {
                    QueueName: stageConfig.getJobQueueName(),
                    VisibilityTimeout: 60
                }
            },
            ProducerBucket: {
                Type: 'AWS::S3::Bucket',
                Properties: {
                    BucketName: stageConfig.getProducerBucketName()
                }
            }
        }
    },
    functions: {
        producer,
        worker,
        query
    },
    package: {individually: true},
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
            define: {'require.resolve': undefined},
            platform: 'node',
            concurrency: 10,
        },
    },
};

module.exports = serverlessConfiguration;

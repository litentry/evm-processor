import type {AWS} from '@serverless/typescript';

import producer from '@functions/producer';
import worker from '@functions/worker';

const serverlessConfiguration: AWS = {
    service: 'archive-indexer',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild'],
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
                    QueueName: 'JobQueue'
                }
            }
        }
    },
    functions: {
        producer,
        worker
    },
    package: {individually: true},
    custom: {
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

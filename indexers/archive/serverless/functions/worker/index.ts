import { handlerPath } from '@libs/handler-resolver';

export default {
    handler: `${handlerPath(__dirname)}/handler.default`,
    reservedConcurrency: 1,
    events: [
        {
            sqs: {
                arn: {
                    'Fn::GetAtt': [
                        'JobQueue', 'Arn'
                    ]
                }
            }
        }
    ],
    environment: {
        QUEUE_URL: { Ref: 'JobQueue' },
        RPC_ENDPOINT: 'https://rpc.ankr.com/eth'
    },
    timeout: 20,
};

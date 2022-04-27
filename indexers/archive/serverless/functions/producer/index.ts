import { handlerPath } from '@libs/handler-resolver';

export default {
    handler: `${handlerPath(__dirname)}/handler.default`,
    events: [
        {
            schedule: "rate(2 minutes)"
        }
    ],
    environment: {
        QUEUE_URL: { Ref: 'JobQueue' },
        RPC_ENDPOINT: 'https://rpc.ankr.com/eth'
    }
};

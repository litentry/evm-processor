import { handlerPath } from '@libs/handler-resolver';
import stageConfigFactory from '../../config/stage-config';
import { getContext } from "../../util/context";

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);

export default {
    handler: `${handlerPath(__dirname)}/handler.default`,
    reservedConcurrency: stageConfig.getWorkerConcurrency(),
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
        RPC_ENDPOINT: 'https://rpc.ankr.com/eth',
        MONGO_URI: stageConfig.getMongoURI()
    },
    timeout: 20,
};

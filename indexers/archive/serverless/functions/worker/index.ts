import { handlerPath } from '@libs/handler-resolver';
import { AWS } from "@serverless/typescript";
import stageConfigFactory from '../../config/stage-config';
import { getContext } from "../../util/context";

export default async () => {
  const context = await getContext();
  const stageConfig = stageConfigFactory(context.options.stage);
  return {
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
  } as AWS['functions'][0];
}

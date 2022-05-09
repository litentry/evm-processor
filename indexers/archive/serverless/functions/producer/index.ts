import { handlerPath } from '@libs/handler-resolver';
import { AWS } from "@serverless/typescript";
import { getContext } from "../../util/context";
import stageConfigFactory from "../../config/stage-config";

export default async () => {
  const context = await getContext();
  const stageConfig = stageConfigFactory(context.options.stage);
  return {
    handler: `${handlerPath(__dirname)}/handler.default`,
    reservedConcurrency: 1,
    events: [
      {
        schedule: "rate(1 minute)"
      }
    ],
    environment: {
      QUEUE_URL: { Ref: 'JobQueue' },
      RPC_ENDPOINT: 'https://rpc.ankr.com/eth',
      BATCH_SIZE: String(stageConfig.getProducerBatchSize()),
      START_BLOCK: String(stageConfig.getProducerStartBlock()),
      END_BLOCK: String(stageConfig.getProducerEndBlock()),
      BUCKET_NAME: stageConfig.getProducerBucketName(),
      MONGO_URI: stageConfig.getMongoURI()
    },
  } as AWS['functions'][0];
}

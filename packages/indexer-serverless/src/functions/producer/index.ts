import { AWS } from '@serverless/typescript';
import { handlerPath } from '../../libs/handler-resolver';
import { getContext } from '../../util/context';
import stageConfigFactory from '../../config/stage-config';
import { Config } from '../../types';

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);

export default (config: Config) =>
  ({
    handler: `${handlerPath(__dirname)}/handler.default`,
    reservedConcurrency: 1,
    events: [
      {
        schedule: 'rate(1 minute)',
      },
    ],
    environment: {
      QUEUE_URL: { Ref: 'JobQueue' },
      RPC_ENDPOINT: config.rpcEndpoint,
      LATEST_BLOCK_DEPENDENCY: config.latestBlockDependency,
      BATCH_SIZE: String(stageConfig.getProducerBatchSize()),
      START_BLOCK: String(stageConfig.getProducerStartBlock()),
      END_BLOCK: String(stageConfig.getProducerEndBlock()),
      BUCKET_NAME: stageConfig.getProducerBucketName(),
      MONGO_URI: stageConfig.getMongoURI(),
    },
  } as keyof AWS['functions']);

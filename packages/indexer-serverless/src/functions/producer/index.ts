import { AWS } from '@serverless/typescript';
import { getContext } from '../../util/context';
import stageConfigFactory from '../../config/stage-config';
import { Config } from '../../types';

const context = getContext();
const stageConfig = stageConfigFactory(context.options.stage);

export default (config: Config) =>
  ({
    handler: './src/lambda/producer.default',
    reservedConcurrency: 1,
    events: [
      {
        schedule: 'rate(1 minute)',
      },
    ],
    environment: {
      QUEUE_URL: { Ref: 'JobQueue' },
      RPC_ENDPOINT: config.rpcEndpoint,
      ARCHIVE_GRAPH: config.archiveGraph,
      TOKEN_ACTIVITY_GRAPH: config.tokenActivityGraph,
      CONTRACT_GRAPH: config.contractGraph,
      LATEST_BLOCK_DEPENDENCY: config.latestBlockDependency,
      BATCH_SIZE: String(stageConfig.getProducerBatchSize()),
      END_BLOCK: String(stageConfig.getProducerEndBlock()),
      BUCKET_NAME: stageConfig.getProducerBucketName(),
      MONGO_URI: stageConfig.getMongoURI(),
    },
  } as keyof AWS['functions']);

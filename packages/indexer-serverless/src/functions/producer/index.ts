import { AWS } from '@serverless/typescript';
import { getContext } from '../../util/context';
import stageConfigFactory from '../../config/stage-config';
import { Config, Params } from '../../types';

const context = getContext();

export default function (config: Config, params: Params) {
  const stageConfig = stageConfigFactory(context.options.stage, params);
  return {
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
      MONGO_URI: stageConfig.getMongoURI(),
      MAX_WORKERS: config.maxWorkers,
    },
  } as keyof AWS['functions'];
}

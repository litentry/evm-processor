import { AWS } from '@serverless/typescript';
import stageConfigFactory from '../../config/stage-config';
<<<<<<< HEAD
import { Config } from '../../types';
import { getContext } from '../../util/context';
=======
import { Config, Params } from '../../types';
>>>>>>> remotes/origin/main

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
<<<<<<< HEAD
      PUSHGATEWAY_URL: stageConfig.getPushGatewayURL(),
=======
      MAX_WORKERS: config.maxWorkers,
>>>>>>> remotes/origin/main
    },
  } as keyof AWS['functions'];
}

import { AWS } from '@serverless/typescript';
import stageConfigFactory from '../../config/stage-config';
import { Config, Params } from '../../types';
import { getContext } from '../../util/context';
import getEnvVar from '../../util/get-env-var';

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
      QUEUE_DLQ_URL: { Ref: 'JobQueueDLQ' },
      RPC_ENDPOINT: config.lastBlockRpcEndpoint || config.rpcEndpoint,
      ARCHIVE_GRAPH: config.archiveGraph,
      TOKEN_ACTIVITY_GRAPH: config.tokenActivityGraph,
      CONTRACT_GRAPH: config.contractGraph,
      LATEST_BLOCK_DEPENDENCY: config.latestBlockDependency,
      BATCH_SIZE: String(stageConfig.getProducerBatchSize()),
      END_BLOCK: String(stageConfig.getProducerEndBlock()),
      MONGO_URI: stageConfig.getMongoURI(),
      PUSHGATEWAY_URL: stageConfig.getPushGatewayURL(),
      CHAIN: config.chain,
      DEPLOY_VERSION: config.version,
      MAX_WORKERS: config.maxWorkers,
      TARGET_TOTAL_QUEUED_BLOCKS: config.targetTotalQueuedBlocks,
      SERVICE_NAME: config.serviceName,
      SHARDING_ENABLED: <string>getEnvVar('SHARDING_ENABLED', true)
    },
    timeout: 60,
  } as keyof AWS['functions'];
}

import 'dotenv/config';
import { serverless, Chain } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'uniswap',
  chain: <Chain>process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  latestBlockDependency: 'contract-graph',
  archiveGraph: process.env.ARCHIVE_GRAPH,
  contractGraph: process.env.CONTRACT_GRAPH,
  maxWorkers: parseInt(process.env.MAX_WORKERS!) || 1,
  targetTotalQueuedBlocks:
    parseInt(process.env.TARGET_TOTAL_QUEUED_BLOCKS!) || 50000,
});

import 'dotenv/config';
import { serverless, Chain } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'web3go',
  chain: <Chain>process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  archiveGraph: process.env.ARCHIVE_GRAPH,
  contractGraph: process.env.CONTRACT_GRAPH,
  tokenActivityGraph: process.env.TOKEN_ACTIVITY_GRAPH,
  maxWorkers: parseInt(process.env.MAX_WORKERS!) || 1,
  targetTotalQueuedBlocks:
    parseInt(process.env.TARGET_TOTAL_QUEUED_BLOCKS!) || 10000,
});

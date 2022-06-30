import 'dotenv/config';
import { Chain, serverless } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'nft',
  chain: <Chain>process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  rpcEndpoint: process.env.RPC_ENDPOINT,
  archiveGraph: process.env.ARCHIVE_GRAPH,
  contractGraph: process.env.CONTRACT_GRAPH,
  maxWorkers: parseInt(process.env.MAX_WORKERS!) || 1,
  targetTotalQueuedBlocks:
    parseInt(process.env.TARGET_TOTAL_QUEUED_BLOCKS!) || 10000,
});

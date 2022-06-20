import 'dotenv/config';
import { Chain, ExtractionSource, serverless } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'archive',
  chain: <Chain>process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  rpcEndpoint: process.env.RPC_ENDPOINT,
  lastBlockRpcEndpoint: process.env.LAST_BLOCK_RPC_ENDPOINT,
  extractionSource: <ExtractionSource>process.env.EXTRACTION_SOURCE,
  maxWorkers: parseInt(process.env.MAX_WORKERS!) || 1,
  targetTotalQueuedBlocks:
    parseInt(process.env.TARGET_TOTAL_QUEUED_BLOCKS!) || 500,
});

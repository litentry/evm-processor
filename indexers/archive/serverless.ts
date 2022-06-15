import 'dotenv/config';
import { serverless, Chain, ExtractionSource } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'archive',
  chain: <Chain>process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  latestBlockDependency: 'archive-node',
  rpcEndpoint: process.env.RPC_ENDPOINT,
  extractionSource: <ExtractionSource>process.env.EXTRACTION_SOURCE,
  maxWorkers: parseInt(process.env.MAX_WORKERS!) || 1,
  targetTotalQueuedBlocks:
    parseInt(process.env.TARGET_TOTAL_QUEUED_BLOCKS!) || 500,
});

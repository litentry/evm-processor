import 'dotenv/config';
import { serverless } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'nft',
  chain: process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  latestBlockDependency: 'token-activity-graph',
  tokenActivityGraph: process.env.TOKEN_ACTIVITY_GRAPH,
  maxWorkers: parseInt(process.env.MAX_WORKERS!) || 1,
});
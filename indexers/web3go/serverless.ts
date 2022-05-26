import 'dotenv/config';
import { serverless } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'web3go',
  chain: process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  latestBlockDependency: 'token-activity-graph',
  rpcEndpoint: process.env.RPC_ENDPOINT,
  archiveGraph: process.env.ARCHIVE_GRAPH,
  contractGraph: process.env.CONTRACT_GRAPH,
  tokenActivityGraph: process.env.TOKEN_ACTIVITY_GRAPH,
  maxWorkers: parseInt(process.env.MAX_WORKERS!) || 1,
});

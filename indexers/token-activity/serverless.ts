import 'dotenv/config';
import { serverless } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'token-activity',
  chain: process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  latestBlockDependency: 'contract-graph',
  rpcEndpoint: process.env.RPC_ENDPOINT,
  archiveGraph: process.env.ARCHIVE_GRAPH,
  contractGraph: process.env.CONTRACT_GRAPH,
});

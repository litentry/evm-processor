import 'dotenv/config';
import { serverless } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'archive',
  chain: process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  latestBlockDependency: 'archive-node',
  rpcEndpoint: process.env.RPC_ENDPOINT,
});

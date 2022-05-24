import 'dotenv/config';
import { serverless } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'archive',
  latestBlockDependency: 'archive-node',
  rpcEndpoint: process.env.RPC_ENDPOINT,
});

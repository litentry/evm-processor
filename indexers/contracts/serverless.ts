import 'dotenv/config';
import { serverless, Chain } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'contracts',
  chain: <Chain>process.env.CHAIN!,
  version: process.env.DEPLOY_VERSION!,
  latestBlockDependency: 'archive-graph',
  rpcEndpoint: process.env.RPC_ENDPOINT,
  archiveGraph: process.env.ARCHIVE_GRAPH,
  maxWorkers: parseInt(process.env.MAX_WORKERS!) || 1,
});

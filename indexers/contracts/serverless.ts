import 'dotenv/config';
import { serverless } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'contracts',
  latestBlockDependency: 'archive-graph',
  rpcEndpoint: process.env.RPC_ENDPOINT,
  archiveGraph: process.env.ARCHIVE_GRAPH,
});

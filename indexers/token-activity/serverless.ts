import 'dotenv/config';
import { serverless } from 'indexer-serverless';

module.exports = serverless({
  serviceName: 'token-activity',
  latestBlockDependency: 'contract-graph',
  rpcEndpoint: process.env.RPC_ENDPOINT,
  archiveGraph: process.env.ARCHIVE_GRAPH,
  contractGraph: process.env.CONTRACT_GRAPH,
});

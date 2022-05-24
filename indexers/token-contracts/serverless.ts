import 'dotenv/config';
import { serverless } from 'indexer-serverless';

// async function run() {
//   const a = await serverless({
//     serviceName: 'token-contracts',
//     latestBlockDependency: 'archive-graph',
//     rpcEndpoint: process.env.RPC_ENDPOINT,
//     archiveGraph: process.env.ARCHIVE_GRAPH,
//   });
//   console.log(a);
// }
// run();

module.exports = serverless({
  serviceName: 'token-contracts',
  latestBlockDependency: 'archive-graph',
  rpcEndpoint: process.env.RPC_ENDPOINT,
  archiveGraph: process.env.ARCHIVE_GRAPH,
});

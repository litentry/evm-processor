import { web3, query } from 'indexer-utils';

export default function getLatestBlock(source: string): () => Promise<number> {
  switch (source) {
    case 'archive-node':
      return web3.eth.getBlockNumber;
    case 'archive-graph':
      return query.archive.latestBlock;
    case 'contract-graph':
      return query.contracts.latestBlock;
    case 'token-actvity-graph':
      return query.tokenActivity.latestBlock;
  }

  throw Error('getLatestBlock source unknown');
}

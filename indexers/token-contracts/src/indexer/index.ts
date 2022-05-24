import { query, repository } from 'indexer-utils';
import handleContractCreation from './handle-contract-creation';

export default async function indexer(startBlock: number, endBlock: number) {
  const txs = await query.archive.contractCreationTransactions({
    startBlock,
    endBlock,
    properties: [
      'receiptContractAddress',
      'from',
      'blockNumber',
      'blockTimestamp',
      'input',
      'receiptStatus',
    ],
  });
  const results = await Promise.allSettled(txs.map(handleContractCreation));

  const rejected = results.filter((result) => result.status === 'rejected');
  if (rejected.length) {
    throw rejected;
  }

  await repository.indexedBlockRange.save(startBlock, endBlock);
}

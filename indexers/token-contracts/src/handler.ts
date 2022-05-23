import { query } from 'indexer-utils';
import handleContractCreation from './handle-contract-creation';
import { BlockModel } from './schema';

export default async function handler(startBlock: number, endBlock: number) {
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

  // todo this will only work in streaming mode, multiple instances need a more sophisticated progress schema
  await BlockModel.create({ number: endBlock });
}

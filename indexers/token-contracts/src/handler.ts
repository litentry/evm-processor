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
  await Promise.all(txs.map(handleContractCreation));

  // todo this will only work in streaming mode, multiple instances need a more sophisticated progress schema
  await BlockModel.create({ number: endBlock });
}

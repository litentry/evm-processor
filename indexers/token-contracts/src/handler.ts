import { query } from 'indexer-utils';
import handleContractCreation from './handle-contract-creation';

export default async function handler(startBlock: number, endBlock: number) {
  const txs = await query.contractCreationTransactions({
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
  if (txs) await Promise.all(txs.map(handleContractCreation));
}

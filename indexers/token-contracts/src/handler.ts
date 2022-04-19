import { query } from 'indexer-utils';
import handleContractCreation from './handle-contract-creation';

export default async function handler(start: number, end: number) {
  const txs = await query.contractCreationTransactions(start, end, undefined, [
    'receiptContractAddress',
    'from',
    'blockNumber',
    'blockTimestamp',
    'input',
    'receiptStatus',
  ]);
  if (txs) await Promise.all(txs.map(handleContractCreation));
}

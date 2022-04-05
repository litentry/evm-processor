import * as ethers from 'ethers';
import { Log, ContractSignatures, Transaction } from './types';
import { getReceipts } from './get-receipts';
import { mapTransactionsAndLogs } from './map-transactions-and-logs';

export async function getTransactionsLogsAndContractsByBlock(
  provider: ethers.providers.JsonRpcProvider,
  blockNumber: number
): Promise<{
  transactions: Transaction[];
  logs: Log[];
  contractSignatures: ContractSignatures[];
}> {
  const { transactions: blockTransactions, hash: blockHash } =
    await provider.getBlockWithTransactions(blockNumber);

  const receipts = await getReceipts(
    provider,
    blockTransactions.map((tx) => tx.hash)
  );

  return mapTransactionsAndLogs(
    blockNumber,
    blockHash,
    blockTransactions,
    receipts
  );
}

import * as ethers from 'ethers';
import { getContractSignatures } from './get-contract-signatures';
import { Log, ContractSignatures, Transaction } from './types';

export function mapTransactionsAndLogs(
  blockNumber: number,
  blockHash: string,
  blockTransactions: ethers.providers.TransactionResponse[],
  receipts: ethers.providers.TransactionReceipt[]
) {
  const transactions: Transaction[] = [];
  const logs: Log[] = [];
  const contractSignatures: ContractSignatures[] = [];

  blockTransactions.forEach(
    ({ hash, data, value, from, to, type, accessList, nonce }, i) => {
      const receipt = receipts[i];

      // store separately should we need failed transactions
      if (receipt.status !== 1) return;

      const methodId = data.substring(2, 10);

      if (receipt.contractAddress) {
        const signatures = getContractSignatures(data);
        contractSignatures.push(
          ...signatures.map((signature) => ({
            signature,
            contractAddress: receipt.contractAddress,
            blockNumber,
          }))
        );
      }

      transactions.push({
        blockNumber,
        blockHash,
        hash,
        data,
        value,
        from,
        to,
        methodId,
        transactionIndex: receipt.transactionIndex,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        contractCreated: receipt.contractAddress,
        type: type ?? undefined,
        accessList: accessList ? accessList.join(',') : undefined,
        nonce,
      });

      receipt.logs.forEach(({ address, topics, data, logIndex }) => {
        logs.push({
          transactionHash: hash,
          address,
          topic0: topics[0],
          topic1: topics[1],
          topic2: topics[2],
          topic3: topics[3],
          topic4: topics[4],
          data,
          logIndex,
          blockNumber,
        });
      });
    }
  );

  return {
    transactions,
    logs,
    contractSignatures,
  };
}

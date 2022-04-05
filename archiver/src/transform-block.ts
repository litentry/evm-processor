import * as ethers from 'ethers';
import { getContractSignatures } from './get-contract-signatures';
import { Log, ContractSignature, Transaction } from './types';

export default function transformBlock({
  blockHash,
  blockNumber,
  transactions: blockTransactions,
  receipts,
}: {
  blockNumber: number;
  blockHash: string;
  transactions: ethers.providers.TransactionResponse[];
  receipts: ethers.providers.TransactionReceipt[];
}): {
  transactions: Transaction[];
  logs: Log[];
  contractSignatures: ContractSignature[];
} {
  const transactions: Transaction[] = [];
  const logs: Log[] = [];
  const contractSignatures: ContractSignature[] = [];

  blockTransactions.forEach(
    ({ hash, data, value, from, to, type, accessList, nonce }, i) => {
      const receipt = receipts.find(
        (receipt) => receipt.transactionHash === hash
      );

      if (!receipt) {
        throw Error(`Receipt not found for transaction: ${hash}`);
      }

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
        value: value.toString(),
        from,
        to,
        methodId,
        transactionIndex: receipt.transactionIndex,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString(),
        cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
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

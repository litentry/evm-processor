import { getContractSignatures } from './get-contract-signatures';
import {
  Log,
  ContractSignature,
  Transaction,
  TransformBlock,
  Block,
} from './types';

const transformBlock: TransformBlock = ({
  blockWithTransactions,
  receipts,
}) => {
  const block: Block = {
    number: blockWithTransactions.number,
    hash: blockWithTransactions.hash,
    parentHash: blockWithTransactions.parentHash,
    nonce: blockWithTransactions.nonce,
    sha3Uncles: blockWithTransactions.sha3Uncles,
    transactionRoot: blockWithTransactions.transactionRoot,
    stateRoot: blockWithTransactions.stateRoot,
    miner: blockWithTransactions.miner.toLowerCase(),
    extraData: blockWithTransactions.extraData,
    gasLimit: blockWithTransactions.gasLimit,
    gasUsed: blockWithTransactions.gasUsed,
    timestamp: blockWithTransactions.timestamp as number,
    size: blockWithTransactions.size,
    difficulty: blockWithTransactions.difficulty as unknown as string,
    totalDifficulty: blockWithTransactions.totalDifficulty as unknown as string,
    uncles: blockWithTransactions.uncles.length
      ? blockWithTransactions.uncles.join(',')
      : undefined,
  };
  const transactions: Transaction[] = [];
  const logs: Log[] = [];
  const contractSignatures: ContractSignature[] = [];

  blockWithTransactions.transactions.forEach(
    ({
      hash,
      nonce,
      transactionIndex,
      from,
      to,
      value,
      gasPrice,
      gas,
      input,
    }) => {
      const receipt = receipts.find(
        (receipt) => receipt.transactionHash === hash
      );

      if (!receipt) {
        throw Error(`Receipt not found for transaction: ${hash}`);
      }

      transactions.push({
        hash,
        nonce,
        blockHash: block.hash,
        blockNumber: block.number,
        blockTimestamp: block.timestamp,
        transactionIndex: transactionIndex!,
        from: from.toLowerCase(),
        to: to?.toLowerCase(),
        value,
        gasPrice,
        gas,
        input,
        methodId: input.substring(2, 10),
        receiptStatus: receipt.status,
        receiptGasUsed: receipt.gasUsed,
        receiptCumulativeGasUsed: receipt.cumulativeGasUsed,
        receiptContractAddress: receipt.contractAddress?.toLowerCase(),
      });

      receipt.logs.forEach(({ address, topics, data, logIndex }) => {
        logs.push({
          transactionHash: hash,
          address: address?.toLowerCase(),
          topic0: topics[0],
          topic1: topics[1],
          topic2: topics[2],
          topic3: topics[3],
          topic4: topics[4],
          data,
          logIndex,
          blockNumber: block.number,
          blockTimestamp: block.timestamp,
        });
      });

      if (receipt.contractAddress) {
        const signatures = getContractSignatures(input);
        contractSignatures.push(
          ...signatures.map((signature) => ({
            signature,
            contractAddress: receipt.contractAddress as string, // we shouldn't need this, TS is being very odd
            blockNumber: block.number,
            blockTimestamp: block.timestamp,
          }))
        );
      }
    }
  );

  return {
    block,
    transactions,
    logs,
    contractSignatures,
  };
};

export default transformBlock;

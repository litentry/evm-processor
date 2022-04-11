import { Transaction as RpcTx, TransactionReceipt } from 'web3-eth';
import {
  Log,
  Block,
  ContractSignature,
  NativeTokenTransaction,
  ContractCreationTransaction,
  ContractTransaction,
  TransactionType,
  TransactionBase,
} from 'archive-sdk';
import { getContractSignatures } from './get-contract-signatures';
import { TransformBlock } from './types';

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
  const nativeTokenTransactions: NativeTokenTransaction[] = [];
  const contractCreationTransactions: ContractCreationTransaction[] = [];
  const contractTransactions: ContractTransaction[] = [];
  const logs: Log[] = [];
  const contractSignatures: ContractSignature[] = [];

  blockWithTransactions.transactions.forEach((tx) => {
    const receipt = receipts.find(
      (receipt) => receipt.transactionHash === tx.hash
    );

    // check the node we're using isn't missing data
    if (!receipt) {
      throw Error(`Receipt not found for transaction: ${tx.hash}`);
    }

    // define the transaction type
    let txType: TransactionType;

    if (receipt.contractAddress) {
      txType = TransactionType.ContractCreationTransaction;
    } else if (tx.input === '0x') {
      txType = TransactionType.NativeTokenTransaction;
    } else {
      txType = TransactionType.ContractTransaction;
    }

    const txBase = mapTransactionBase(
      block.hash,
      block.number,
      block.timestamp,
      tx,
      receipt
    );

    switch (txType) {
      case TransactionType.ContractCreationTransaction: {
        const contractAddress = receipt.contractAddress!.toLowerCase();
        contractCreationTransactions.push({
          ...txBase,
          input: tx.input,
          methodId: tx.input.substring(2, 10),
          receiptContractAddress: contractAddress,
        });

        const signatures = getContractSignatures(tx.input);
        contractSignatures.push(
          ...signatures.map((signature) => ({
            signature,
            contractAddress,
            blockNumber: block.number,
            blockTimestamp: block.timestamp,
          }))
        );
        break;
      }

      case TransactionType.ContractTransaction: {
        contractTransactions.push({
          ...txBase,
          input: tx.input,
          methodId: tx.input.substring(2, 10),
          to: tx.to!.toLowerCase(),
        });
        break;
      }

      case TransactionType.NativeTokenTransaction: {
        nativeTokenTransactions.push({
          ...txBase,
          to: tx.to!.toLowerCase(),
        });
        break;
      }
    }

    receipt.logs.forEach(({ address, topics, data, logIndex }) => {
      logs.push({
        transactionHash: tx.hash,
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
  });

  return {
    block,
    nativeTokenTransactions,
    contractCreationTransactions,
    contractTransactions,
    logs,
    contractSignatures,
  };
};

export default transformBlock;

const mapTransactionBase = (
  blockHash: string,
  blockNumber: number,
  blockTimestamp: number,
  tx: RpcTx,
  receipt: TransactionReceipt
): TransactionBase => ({
  hash: tx.hash,
  nonce: tx.nonce,
  blockHash,
  blockNumber,
  blockTimestamp,
  transactionIndex: tx.transactionIndex!,
  from: tx.from.toLowerCase(),
  value: tx.value,
  gasPrice: tx.gasPrice,
  gas: tx.gas,
  receiptStatus: receipt.status,
  receiptGasUsed: receipt.gasUsed,
  receiptCumulativeGasUsed: receipt.cumulativeGasUsed,
});

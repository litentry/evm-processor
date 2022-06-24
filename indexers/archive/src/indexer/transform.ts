import { BigNumber } from 'ethers';
import { Types } from 'indexer-utils';
import {
  ExtractedBlock,
  RawReceipt,
  RawTransaction,
  TransformedBlock,
} from './types';

function transformBlock({ blockWithTransactions, receipts }: ExtractedBlock) {
  const block: Types.Archive.Block = {
    number: BigNumber.from(blockWithTransactions.number).toNumber(),
    hash: blockWithTransactions.hash,
    parentHash: blockWithTransactions.parentHash,
    nonce: blockWithTransactions.nonce,
    sha3Uncles: blockWithTransactions.sha3Uncles,
    transactionRoot: blockWithTransactions.transactionsRoot,
    stateRoot: blockWithTransactions.stateRoot,
    miner: blockWithTransactions.miner.toLowerCase(),
    extraData: blockWithTransactions.extraData,
    gasLimit: BigNumber.from(blockWithTransactions.gasLimit).toString(),
    gasUsed: BigNumber.from(blockWithTransactions.gasUsed).toString(),
    timestamp: BigNumber.from(blockWithTransactions.timestamp).toNumber(),
    size: BigNumber.from(blockWithTransactions.size).toNumber(),
    difficulty: BigNumber.from(blockWithTransactions.difficulty).toString(),
    totalDifficulty: BigNumber.from(
      blockWithTransactions.totalDifficulty,
    ).toString(),
    uncles: blockWithTransactions.uncles.length
      ? blockWithTransactions.uncles.join(',')
      : undefined,
  };
  const nativeTokenTransactions: Types.Archive.NativeTokenTransaction[] = [];
  const contractCreationTransactions: Types.Archive.ContractCreationTransaction[] =
    [];
  const contractTransactions: Types.Archive.ContractTransaction[] = [];
  const logs: Types.Archive.Log[] = [];

  blockWithTransactions.transactions.forEach((tx) => {
    const receipt = receipts.find(
      (receipt) => receipt.transactionHash === tx.hash,
    );

    // check the node we're using isn't missing data
    if (!receipt) {
      throw Error(`Receipt not found for transaction: ${tx.hash}`);
    }

    // define the transaction type
    let txType: Types.Archive.TransactionType;

    if (receipt.contractAddress) {
      txType = Types.Archive.TransactionType.ContractCreationTransaction;
    } else if (tx.input === '0x') {
      txType = Types.Archive.TransactionType.NativeTokenTransaction;
    } else {
      txType = Types.Archive.TransactionType.ContractTransaction;
    }

    const txBase = mapTransactionBase(
      block.hash,
      block.number,
      block.timestamp,
      tx,
      receipt,
    );

    switch (txType) {
      case Types.Archive.TransactionType.ContractCreationTransaction: {
        const contractAddress = receipt.contractAddress!.toLowerCase();
        contractCreationTransactions.push({
          ...txBase,
          input: tx.input,
          methodId: tx.input.substring(2, 10),
          receiptContractAddress: contractAddress,
        });
        break;
      }

      case Types.Archive.TransactionType.ContractTransaction: {
        contractTransactions.push({
          ...txBase,
          input: tx.input,
          methodId: tx.input.substring(2, 10),
          to: tx.to!.toLowerCase(),
        });
        break;
      }

      case Types.Archive.TransactionType.NativeTokenTransaction: {
        nativeTokenTransactions.push({
          ...txBase,
          to: tx.to!.toLowerCase(),
        });
        break;
      }
    }

    receipt.logs.forEach(
      ({ address, topics, data, logIndex: logIndexHash }) => {
        const logIndex = BigNumber.from(logIndexHash).toNumber();
        logs.push({
          uniqueIndex: `${block.number}.${logIndex}`,
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
      },
    );
  });

  return {
    block,
    nativeTokenTransactions,
    contractCreationTransactions,
    contractTransactions,
    logs,
  };
}

const mapTransactionBase = (
  blockHash: string,
  blockNumber: number,
  blockTimestamp: number,
  tx: RawTransaction,
  receipt: RawReceipt,
): Types.Archive.TransactionBase => ({
  hash: tx.hash,
  nonce: BigNumber.from(tx.nonce).toNumber(),
  blockHash,
  blockNumber,
  blockTimestamp,
  transactionIndex: BigNumber.from(tx.transactionIndex).toNumber(),
  from: tx.from.toLowerCase(),
  value: BigNumber.from(tx.value).toString(),
  gasPrice: BigNumber.from(tx.gasPrice).toString(),
  gas: BigNumber.from(tx.gas).toString(),
  receiptStatus: !!BigNumber.from(receipt.status).toNumber(),
  receiptGasUsed: BigNumber.from(receipt.gasUsed).toString(),
  receiptCumulativeGasUsed: BigNumber.from(
    receipt.cumulativeGasUsed,
  ).toString(),
});

export default function transform(
  blocks: ExtractedBlock[],
): TransformedBlock[] {
  return blocks.map(transformBlock);
}

import { ParquetTypes } from "./types";

export const blocks = {
  number: { type: ParquetTypes.INT64 },
  hash: { type: ParquetTypes.UTF8 },
  parentHash: { type: ParquetTypes.UTF8 },
  nonce: { type: ParquetTypes.UTF8, optional: true },
  sha3Uncles: { type: ParquetTypes.UTF8 },
  transactionRoot: { type: ParquetTypes.UTF8, optional: true },
  stateRoot: { type: ParquetTypes.UTF8 },
  receiptsRoot: { type: ParquetTypes.UTF8, optional: true },
  miner: { type: ParquetTypes.UTF8 },
  extraData: { type: ParquetTypes.UTF8 },
  gasLimit: { type: ParquetTypes.INT64 },
  gasUsed: { type: ParquetTypes.INT64 },
  timestamp: { type: ParquetTypes.INT64 },
  baseFeePerGas: { type: ParquetTypes.INT64, optional: true },
  size: { type: ParquetTypes.INT64 },
  difficulty: { type: ParquetTypes.UTF8 },
  totalDifficulty: { type: ParquetTypes.UTF8 },
  uncles: { type: ParquetTypes.UTF8, optional: true },
};

export const contractSignatures = {
  blockNumber: { type: ParquetTypes.INT64 },
  blockTimestamp: { type: ParquetTypes.INT64 },
  contractAddress: { type: ParquetTypes.UTF8 },
  signature: { type: ParquetTypes.UTF8 },
};

export const logs = {
  blockNumber: { type: ParquetTypes.INT64 },
  transactionHash: { type: ParquetTypes.UTF8 },
  address: { type: ParquetTypes.UTF8 },
  topic0: { type: ParquetTypes.UTF8 },
  topic1: { type: ParquetTypes.UTF8, optional: true },
  topic2: { type: ParquetTypes.UTF8, optional: true },
  topic3: { type: ParquetTypes.UTF8, optional: true },
  topic4: { type: ParquetTypes.UTF8, optional: true },
  data: { type: ParquetTypes.UTF8 },
  logIndex: { type: ParquetTypes.INT64 },
};

const baseTransaction = {
  hash: { type: ParquetTypes.UTF8 },
  nonce: { type: ParquetTypes.INT64 },
  blockHash: { type: ParquetTypes.UTF8 },
  blockNumber: { type: ParquetTypes.INT64 },
  blockTimestamp: { type: ParquetTypes.INT64 },
  transactionIndex: { type: ParquetTypes.INT64 },
  from: { type: ParquetTypes.UTF8 },
  value: { type: ParquetTypes.UTF8 },
  gasPrice: { type: ParquetTypes.UTF8 },
  gas: { type: ParquetTypes.INT64 },
  receiptStatus: { type: ParquetTypes.BOOLEAN, optional: true },
  receiptGasUsed: { type: ParquetTypes.INT64 },
  receiptCumulativeGasUsed: { type: ParquetTypes.INT64 },
};

export const nativeTokenTransactions = {
  ...baseTransaction,
  to: { type: ParquetTypes.UTF8 },
};

export const contractTransactions = {
  ...baseTransaction,
  to: { type: ParquetTypes.UTF8, },
  methodId: { type: ParquetTypes.UTF8, },
  input: { type: ParquetTypes.UTF8, },
};

export const contractCreationTransactions = {
  ...baseTransaction,
  methodId: { type: ParquetTypes.UTF8, },
  input: { type: ParquetTypes.UTF8 },
  receiptContractAddress: { type: ParquetTypes.UTF8 },
};

export default {
  blocks,
  contractSignatures,
  logs,
  nativeTokenTransactions,
  contractTransactions,
  contractCreationTransactions,
}
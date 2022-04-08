import Web3 from 'web3';
import { BlockTransactionObject, TransactionReceipt } from 'web3-eth';

export type Config = {
  web3: Web3;
  loadType: 'mongo' | 'parquet';
  mongoUri?: string;
  batchSize: number;
  startBlock?: number;
  endBlock?: number;
};

export type ExtractedBlock = {
  blockWithTransactions: BlockTransactionObject;
  receipts: TransactionReceipt[];
};

export type TransformedBlock = {
  transactions: Transaction[];
  logs: Log[];
  contractSignatures: ContractSignature[];
  block: Block;
};

export type ExtractBlock = (blockNumber: number) => Promise<ExtractedBlock>;

export type TransformBlock = (
  extractedBlock: ExtractedBlock
) => TransformedBlock;

export type LoadBlock = (transformedBlock: TransformedBlock) => Promise<void>;

export type ContractSignature = {
  blockNumber: number; // partition
  blockTimestamp: number;
  contractAddress: string;
  signature: string; // index
};

export type Block = {
  number: number;
  hash: string;
  parentHash: string;
  nonce?: string;
  sha3Uncles: string;
  transactionRoot?: string;
  stateRoot: string;
  miner: string;
  extraData: string;
  gasLimit: number;
  gasUsed: number;
  timestamp: number;
  size: number;
  difficulty: string;
  totalDifficulty: string;
  uncles?: string;
};

export type Log = {
  blockNumber: number; // index
  blockTimestamp: number;
  transactionHash: string; // index
  address: string; // index (contract triggered by)
  topic0: string; // index (eventId)
  topic1?: string;
  topic2?: string;
  topic3?: string;
  topic4?: string;
  data: string;
  logIndex: number;
};

export type Transaction = {
  // from BlockTransactionObject
  hash: string;
  nonce: number;
  blockHash: string;
  blockNumber: number; // index
  blockTimestamp: number;
  transactionIndex: number;
  from: string;
  to?: string; // index (fetch by contract)
  value: string;
  gasPrice: string; // 2930 & Legacy (why is this required in Web3 type?)
  gas: number;
  input: string;

  // first 4 bytes of input
  methodId?: string; // index

  // from receipt
  receiptStatus?: boolean; // not available before byzantium upgrade
  receiptGasUsed: number;
  receiptCumulativeGasUsed: number;
  receiptContractAddress?: string;
};

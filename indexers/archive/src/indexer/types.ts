import { Types } from 'indexer-utils';

export interface ExtractedBlock {
  blockWithTransactions: RawBlock;
  receipts: RawReceipt[];
}

export interface TransformedBlock {
  nativeTokenTransactions: Types.Archive.NativeTokenTransaction[];
  contractCreationTransactions: Types.Archive.ContractCreationTransaction[];
  contractTransactions: Types.Archive.ContractTransaction[];
  logs: Types.Archive.Log[];
  block: Types.Archive.Block;
}

export type ExtractBlock = (blockNumber: number) => Promise<ExtractedBlock>;

export type RawBlock = {
  miner: string;
  difficulty: string;
  gasUsed: string;
  size: string;
  nonce: string;
  hash: string;
  stateRoot: string;
  number: string;
  timestamp: string;
  extraData: string;
  parentHash: string;
  sha3Uncles: string;
  transactionsRoot: string;
  receiptsRoot: string;
  totalDifficulty: string;
  gasLimit: string;
  logsBloom: string;
  uncles: string[];
  mixHash: string;
  transactions: RawTransaction[];
};

export type RawTransaction = {
  nonce: string;
  to?: string;
  type: string;
  r: string;
  blockHash: string;
  hash: string;
  input: string;
  from: string;
  gas: string;
  value: string;
  v: string;
  s: string;
  blockNumber: string;
  gasPrice: string;
  transactionIndex: string;
};

export type RawReceipt = {
  status: string;
  contractAddress?: string;
  blockNumber: string;
  transactionIndex: string;
  logs: RawLog[];
  transactionHash: string;
  gasUsed: string;
  type: string;
  from: string;
  to?: string;
  cumulativeGasUsed: string;
  logsBloom: string;
  blockHash: string;
};

export type RawLog = {
  removed: boolean;
  address: string;
  topics: string[];
  blockNumber: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  data: string;
  transactionHash: string;
};

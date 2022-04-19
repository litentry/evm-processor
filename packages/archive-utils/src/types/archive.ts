export interface Block {
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
}

export interface Log {
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
}

export enum TransactionType {
  NativeTokenTransaction = 'NativeTokenTransaction',
  ContractCreationTransaction = 'ContractCreationTransaction',
  ContractTransaction = 'ContractTransaction',
}

export type Transaction =
  | NativeTokenTransaction
  | ContractCreationTransaction
  | ContractTransaction;

export interface TransactionBase {
  hash: string;
  nonce: number;
  blockHash: string;
  blockNumber: number; // index
  blockTimestamp: number;
  transactionIndex: number;
  from: string;
  value: string;
  gasPrice: string; // 2930 & Legacy (why is this required in Web3 type?)
  gas: number;
  receiptStatus?: boolean; // not available before byzantium upgrade
  receiptCumulativeGasUsed: number;
  receiptGasUsed: number;
}

export interface NativeTokenTransaction extends TransactionBase {
  to: string;
}

export interface ContractTransaction extends TransactionBase {
  to: string;
  input: string;
  methodId: string;
}

export interface ContractTransactionWithLogs extends ContractTransaction {
  logs: Log[];
}

export interface ContractCreationTransaction extends TransactionBase {
  input: string;
  methodId: string;
  receiptContractAddress: string;
}

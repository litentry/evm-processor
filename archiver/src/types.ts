import Web3 from 'web3';
import { BlockTransactionObject, TransactionReceipt } from 'web3-eth';

export interface Config {
  web3: Web3;
  loadType: 'mongo' | 'parquet';
  mongoUri?: string;
  batchSize: number;
  startBlock?: number;
  endBlock?: number;
}

export interface ExtractedBlock {
  blockWithTransactions: BlockTransactionObject;
  receipts: TransactionReceipt[];
}

export interface TransformedBlock {
  nativeTokenTransactions: NativeTokenTransaction[];
  contractCreationTransactions: ContractCreationTransaction[];
  contractTransactions: ContractTransaction[];
  logs: Log[];
  contractSignatures: ContractSignature[];
  block: Block;
}

export type ExtractBlock = (blockNumber: number) => Promise<ExtractedBlock>;

export type TransformBlock = (
  extractedBlock: ExtractedBlock
) => TransformedBlock;

export type LoadBlock = (transformedBlock: TransformedBlock) => Promise<void>;

export interface ContractSignature {
  blockNumber: number; // partition
  blockTimestamp: number;
  contractAddress: string;
  signature: string; // index
}

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
/*
{
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
}
*/

export interface TransactionBase {
  // from BlockTransactionObject
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

export interface ContractCreationTransaction extends TransactionBase {
  input: string;
  methodId: string;
  receiptContractAddress: string;
}

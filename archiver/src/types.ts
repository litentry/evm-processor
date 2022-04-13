import {
  Block,
  ContractCreationTransaction,
  ContractSignature,
  ContractTransaction,
  Log,
  NativeTokenTransaction,
} from 'archive-sdk';
import Web3 from 'web3';
import { BlockTransactionObject, TransactionReceipt } from 'web3-eth';

export interface Config {
  web3: Web3;
  loadType: 'mongo' | 'parquet';
  mongoUri?: string;
  batchSize: number;
  startBlock?: number;
  endBlock?: number;
  parquet: {
    blocksPerFile: number;
  }
};

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

export type Cleanup = () => Promise<any>;

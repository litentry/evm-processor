import { Types } from 'archive-utils';
import Web3 from 'web3';
import { BlockTransactionObject, TransactionReceipt } from 'web3-eth';

export interface Config {
  web3: Web3;
  mongoUri: string;
  batchSize: number;
  startBlock?: number;
  endBlock?: number;
}

export interface ExtractedBlock {
  blockWithTransactions: BlockTransactionObject;
  receipts: TransactionReceipt[];
}

export interface TransformedBlock {
  nativeTokenTransactions: Types.Archive.NativeTokenTransaction[];
  contractCreationTransactions: Types.Archive.ContractCreationTransaction[];
  contractTransactions: Types.Archive.ContractTransaction[];
  logs: Types.Archive.Log[];
  contractSignatures: Types.Archive.ContractSignature[];
  block: Types.Archive.Block;
}

export type ExtractBlock = (blockNumber: number) => Promise<ExtractedBlock>;

export type TransformBlock = (
  extractedBlock: ExtractedBlock
) => TransformedBlock;

export type LoadBlock = (transformedBlock: TransformedBlock) => Promise<void>;

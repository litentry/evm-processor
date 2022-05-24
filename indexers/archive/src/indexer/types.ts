import { AwsSqsConfig } from 'aws-utils';
import { Types } from 'indexer-utils';
import Web3 from 'web3';
import { BlockTransactionObject, TransactionReceipt } from 'web3-eth';

export interface Config {
  port: number;
  web3: Web3;
  mongoUri: string;
  batchSize: number;
  start: number;
  end: number | (() => Promise<number>);
  sqsConfig: AwsSqsConfig;
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
  block: Types.Archive.Block;
}

export type ExtractBlock = (blockNumber: number) => Promise<ExtractedBlock>;

export type TransformBlock = (
  extractedBlock: ExtractedBlock,
) => TransformedBlock;

export type LoadBlock = (transformedBlock: TransformedBlock) => Promise<void>;

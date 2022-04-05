// import { BigNumber } from 'ethers';
import { ethers } from 'ethers';

export type Config = {
  extractType: 'rpc' | 'bv';
  extractEndpoint: string;
  loadType: 'mongo' | 'parquet';
  mongoUri?: string;
  batchSize: number;
  startBlock?: number;
  endBlock: number;
};

export type ExtractedBlock = {
  transactions: ethers.providers.TransactionResponse[];
  receipts: ethers.providers.TransactionReceipt[];
  blockHash: string;
  blockNumber: number;
};

export type TransformedBlock = {
  transactions: Transaction[];
  logs: Log[];
  contractSignatures: ContractSignature[];
};

export type ExtractBlock = (blockNumber: number) => Promise<ExtractedBlock>;

export type TransformBlock = (
  extractedBlock: ExtractedBlock
) => Promise<TransformedBlock>;

export type LoadBlock = (transformedBlock: TransformedBlock) => Promise<void>;

export type ContractSignature = {
  blockNumber: number; // partition
  contractAddress: string;
  signature: string; // index
};

export type Log = {
  blockNumber: number; // partition
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
  blockNumber: number; // partition
  methodId?: string; // index, first 4 bytes of data to fetch by method
  to?: string; // index (fetch by contract)
  hash: string; // PK?
  blockHash: string;
  data: string;
  value: string; // from BigNumber
  transactionIndex: number;
  from: string;
  gasUsed: string; // from BigNumber
  cumulativeGasUsed: string; // from BigNumber
  effectiveGasPrice: string; // from BigNumber
  contractCreated?: string;
  nonce: number;
  accessList?: string;
  type?: number;
  // status?: boolean // we know this to ignore it
};

import { BigNumber } from 'ethers';

export type ContractSignatures = {
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
  methodId: string; // index, first 4 bytes of data to fetch by method
  to?: string; // index (fetch by contract)
  hash: string; // PK?
  blockHash: string;
  data: string;
  value: BigNumber;
  transactionIndex: number;
  from: string;
  gasUsed: BigNumber;
  cumulativeGasUsed: BigNumber;
  effectiveGasPrice: BigNumber;
  contractCreated?: string;
  nonce: number;
  accessList?: string;
  type?: number;
  // status?: boolean // we know this to ignore it
};

import { ContractTransactionWithLogs } from 'archive-utils';
export interface ProcessorConfig {
  startBlock: number;
  endBlock?: number;
  batchSize: number;
  contracts: ContractSpec;
}

export interface ContractSpec {
  [address: string]: {
    [method: string]: (tx: ContractTransactionWithLogs) => Promise<void>;
  };
}

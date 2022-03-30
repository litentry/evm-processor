import { DataSource } from 'typeorm';

export interface Block {
  timestamp: Date;
  number: BigInt;
  hash: string;
  parent_hash: string;
  nonce: string;
  sha3_uncles: string;
  logs_bloom: string;
  transactions_root: string;
  state_root: string;
  receipts_root: string;
  miner: string;
  difficulty: BigInt;
  total_difficulty: BigInt;
  size: BigInt;
  extra_data: string;
  gas_limit: BigInt;
  gas_used: BigInt;
  transaction_count: BigInt;
  base_fee_per_gas: BigInt;
}

export interface Transaction {
  hash: string;
  nonce: BigInt;
  transaction_index: BigInt;
  from_address: string;
  to_address: string;
  value: BigInt;
  gas: BigInt;
  gas_price: BigInt;
  input: string;
  receipt_cumulative_gas_used: BigInt;
  receipt_gas_used: BigInt;
  receipt_contract_address: string;
  receipt_root: string;
  receipt_status: BigInt;
  block_timestamp: Date;
  block_number: BigInt;
  block_hash: string;
  max_fee_per_gas: BigInt;
  max_priority_fee_per_gas: BigInt;
  transaction_type: BigInt;
  receipt_effective_gas_price: BigInt;
}

export interface Log {
  log_index: BigInt;
  transaction_hash: string;
  transaction_index: BigInt;
  address: string;
  data: string;
  topic0: string;
  topic1: string;
  topic2: string;
  topic3: string;
  block_timestamp: Date;
  block_number: BigInt;
  block_hash: string;
}

export interface TransactionWithLogs extends Transaction {
  logs: Log[];
}

export interface ProcessorConfig {
  startBlock: number;
  endBlock?: number;
  batchSize: number;
  contracts: ContractSpec;
}

export interface ContractSpec {
  [address: string]: {
    [method: string]: (tx: TransactionWithLogs) => Promise<void>;
  };
}

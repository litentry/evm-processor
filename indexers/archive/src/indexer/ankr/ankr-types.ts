export interface AnkrBlock {
  blockchain: string;
  number: string;
  hash: string;
  parentHash: string;
  nonce: string;
  mixHash: string;
  sha3Uncles: string;
  logsBloom: string;
  stateRoot: string;
  miner: string;
  difficulty: string;
  extraData: string;
  size: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  transactionsRoot: string;
  receiptsRoot: string;
  totalDifficulty: string;
  transactions: AnkrTransaction[];
  uncles: string[];
}

export interface AnkrTransaction {
  v: string;
  r: string;
  s: string;
  nonce: string;
  from: string;
  gas: string;
  gasPrice: string;
  input: string;
  blockNumber: string;
  to?: string;
  transactionIndex: string;
  blockHash: string;
  value: string;
  type: string;
  contractAddress?: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  logs: Log[];
  logsBloom: string;
  transactionHash: string;
  hash: string;
  status: string;
  blockchain: string;
  timestamp: string;
  method?: Method;
}

interface Method {
  name: string;
  inputs: MethodInput[];
  string: string;
  signature: string;
  id: string;
  verified: boolean;
}

interface MethodInput {
  name: string;
  type: string;
  size: number;
  valueDecoded: string;
}

interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
  event?: Event;
}

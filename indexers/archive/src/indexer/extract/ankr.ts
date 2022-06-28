import axios from 'axios';
import { metrics, monitoring } from 'indexer-monitoring';
import { ExtractBlock } from '../types';

function getChainParam() {
  if (!process.env.CHAIN) {
    throw Error('CHAIN not set');
  }
  switch (process.env.CHAIN) {
    case 'ethereum': {
      return 'eth';
    }
    case 'bsc': {
      return 'bsc';
    }
    default: {
      throw Error('CHAIN unknown');
    }
  }
}

const extractBlock: ExtractBlock = async (number) => {
  if (!process.env.RPC_ENDPOINT) {
    throw new Error('RPC_ENDPOINT not set');
  }
  const endpoint = process.env.RPC_ENDPOINT;

  const startTimer = Date.now();
  const data = await axios.post(endpoint, {
    jsonrpc: '2.0',
    method: 'ankr_getBlocksRange',
    params: {
      blockchain: getChainParam(),
      fromBlock: number,
      toBlock: number,
    },
    id: 1,
  });
  const time = Date.now() - startTimer;
  monitoring.observe(time, metrics.rpcCalls);
  const ankrBlock = data.data.result.blocks[0] as AnkrBlock;

  return {
    blockWithTransactions: {
      miner: ankrBlock.miner,
      difficulty: ankrBlock.difficulty,
      gasUsed: ankrBlock.gasUsed,
      size: ankrBlock.size,
      nonce: ankrBlock.nonce,
      hash: ankrBlock.hash,
      stateRoot: ankrBlock.stateRoot,
      number: ankrBlock.number,
      timestamp: ankrBlock.timestamp,
      extraData: ankrBlock.extraData,
      parentHash: ankrBlock.parentHash,
      sha3Uncles: ankrBlock.sha3Uncles,
      transactionsRoot: ankrBlock.transactionsRoot,
      receiptsRoot: ankrBlock.receiptsRoot,
      totalDifficulty: ankrBlock.totalDifficulty,
      gasLimit: ankrBlock.gasLimit,
      logsBloom: ankrBlock.logsBloom,
      uncles: ankrBlock.uncles,
      mixHash: ankrBlock.mixHash,
      transactions: ankrBlock.transactions.map((tx) => ({
        nonce: tx.nonce,
        to: tx.to,
        type: tx.type,
        r: tx.r,
        blockHash: tx.blockHash,
        hash: tx.hash,
        input: tx.input,
        from: tx.from,
        gas: tx.gas,
        value: tx.value,
        v: tx.v,
        s: tx.s,
        blockNumber: tx.blockNumber,
        gasPrice: tx.gasPrice,
        transactionIndex: tx.transactionIndex,
      })),
    },
    receipts: ankrBlock.transactions.map((tx) => ({
      status: tx.status,
      contractAddress: tx.contractAddress,
      blockNumber: tx.blockNumber,
      transactionIndex: tx.transactionIndex,
      logs: tx.logs,
      transactionHash: tx.transactionHash,
      gasUsed: tx.gasUsed,
      type: tx.type,
      from: tx.from,
      to: tx.to!,
      cumulativeGasUsed: tx.cumulativeGasUsed,
      logsBloom: tx.logsBloom,
      blockHash: tx.blockHash,
    })),
  };
};

export default extractBlock;

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

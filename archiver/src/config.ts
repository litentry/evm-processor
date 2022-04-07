import 'dotenv/config';
import Web3 from 'web3';
import { WebsocketProvider, HttpProvider } from 'web3-core';
import { Config } from './types';

if (!process.env.EXTRACT_ENDPOINT) {
  throw new Error('process.env.EXTRACT_ENDPOINT must be an RPC provider');
}

let provider: WebsocketProvider | HttpProvider;

if (process.env.EXTRACT_ENDPOINT.startsWith('ws')) {
  provider = new Web3.providers.WebsocketProvider(process.env.EXTRACT_ENDPOINT);
} else {
  provider = new Web3.providers.HttpProvider(process.env.EXTRACT_ENDPOINT);
}

const config: Config = {
  web3: new Web3(provider),
  loadType: process.env.LOAD_TYPE! as 'mongo' | 'parquet',
  mongoUri: process.env.MONGO_URI,
  startBlock: process.env.START_BLOCK
    ? parseInt(process.env.START_BLOCK)
    : undefined,
  endBlock: process.env.END_BLOCK ? parseInt(process.env.END_BLOCK) : undefined,
  batchSize: parseInt(process.env.BATCH_SIZE || '1'),
  parquet: {
    blocksPerFile: parseInt(process.env.PARQUET_BLOCKS_PER_FILE || '100'),
  }
};

export default config;

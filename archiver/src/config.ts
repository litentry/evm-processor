import 'dotenv/config';
import { Config } from './types';
import { web3 } from 'archive-utils';

const config: Config = {
  web3,
  loadType: process.env.LOAD_TYPE! as 'mongo' | 'parquet',
  mongoUri: process.env.MONGO_URI,
  startBlock: process.env.START_BLOCK
    ? parseInt(process.env.START_BLOCK)
    : undefined,
  endBlock: process.env.END_BLOCK ? parseInt(process.env.END_BLOCK) : undefined,
  batchSize: parseInt(process.env.BATCH_SIZE || '1'),
};

export default config;

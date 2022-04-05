import 'dotenv/config';
import { Config } from './types';

const config: Config = {
  extractType: process.env.EXTRACT_TYPE! as 'rpc' | 'bv',
  extractEndpoint: process.env.EXTRACT_ENDPOINT!,
  loadType: process.env.LOAD_TYPE! as 'mongo' | 'parquet',
  mongoUri: process.env.MONGO_URI,
  startBlock: process.env.START_BLOCK
    ? parseInt(process.env.START_BLOCK)
    : undefined,
  endBlock: parseInt(process.env.END_BLOCK || '15000000'),
  batchSize: parseInt(process.env.BATCH_SIZE || '1'),
};

if (!config.extractEndpoint) {
  throw new Error(
    'process.env.EXTRACT_ENDPOINT must be an RPC provider or Block Vision URL'
  );
}

export default config;

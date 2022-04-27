import { Config } from './types';
import { web3 } from 'indexer-utils';

// if (!process.env.MONGO_URI) {
//   throw new Error('MONGO_URI not set');
// }

const config: Config = {
  port: parseInt(process.env.PORT || '4050'),
  web3,
  mongoUri: process.env.MONGO_URI,
  start: parseInt(process.env.START_BLOCK || '0'),
  end: process.env.END_BLOCK
    ? parseInt(process.env.END_BLOCK)
    : web3.eth.getBlockNumber,
  batchSize: parseInt(process.env.BATCH_SIZE || '20'),
};

export default config;

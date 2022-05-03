import { web3 } from 'indexer-utils';
import { Config } from './types';

// if (!process.env.MONGO_URI) {
//   throw new Error('MONGO_URI not set');
// }

const config: Config = {
  port: parseInt(process.env.PORT || '4050'),
  web3,
  mongoUri: process.env.MONGO_URI,
  start: 14703780,
  end: process.env.END_BLOCK
    ? parseInt(process.env.END_BLOCK)
    : web3.eth.getBlockNumber,
  batchSize: 1,
  sqsConfig: {
    region: process.env.AWS_REGION || '',
    queueUrl: process.env.QUEUE_URL || '',
  }
};

export default config;

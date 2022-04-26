import { web3 } from 'indexer-utils';
import { Config } from './types';

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI not set');
}

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw Error('AWS_ACCESS_KEY_ID not set');
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw Error('AWS_SECRET_ACCESS_KEY not set');
}

const config: Config = {
  port: parseInt(process.env.PORT || '4050'),
  web3,
  mongoUri: process.env.MONGO_URI,
  start: parseInt(process.env.START_BLOCK || '0'),
  end: process.env.END_BLOCK
    ? parseInt(process.env.END_BLOCK)
    : web3.eth.getBlockNumber,
  batchSize: parseInt(process.env.BATCH_SIZE || '20'),
  sqsConfig: {
    region: '',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    queueUrl: '',
  }
};

export default config;

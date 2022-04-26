import { AwsSqsConfig } from 'aws-utils';
import { query } from 'indexer-utils';

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw Error('AWS_ACCESS_KEY_ID not set');
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw Error('AWS_SECRET_ACCESS_KEY not set');
}

const port = process.env.PORT ? parseInt(process.env.PORT) : 4051;
const start = process.env.START_BLOCK ? parseInt(process.env.START_BLOCK) : 0;
const end = process.env.END_BLOCK
  ? parseInt(process.env.END_BLOCK)
  : query.tokenContracts.latestBlock;
const batchSize = process.env.BATCH_SIZE
  ? parseInt(process.env.BATCH_SIZE)
  : 500;
const mongoUri = process.env.MONGO_URI!;

const sqsConfig: AwsSqsConfig = {
  region: '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  queueUrl: '',
}

export { port, start, end, batchSize, mongoUri, sqsConfig };

import { AwsSqsConfig } from 'aws-utils';
import { query } from 'indexer-utils';

const port = process.env.PORT ? parseInt(process.env.PORT) : 4052;
const start = process.env.START_BLOCK ? parseInt(process.env.START_BLOCK) : 0;
const end = process.env.END_BLOCK
  ? parseInt(process.env.END_BLOCK)
  : query.tokenContracts.latestBlock;
const batchSize = process.env.BATCH_SIZE
  ? parseInt(process.env.BATCH_SIZE)
  : 100;
const mongoUri = process.env.MONGO_URI!;

const sqsConfig: AwsSqsConfig = {
  queueUrl: '',
};

export { port, start, end, batchSize, mongoUri, sqsConfig };

import { query } from 'indexer-utils';

const port = process.env.PORT ? parseInt(process.env.PORT) : 4052;
const start = process.env.START_BLOCK ? parseInt(process.env.START_BLOCK) : 0;
const end = process.env.END_BLOCK
  ? parseInt(process.env.END_BLOCK)
  : query.tokenContracts.latestBlock;
const batchSize = process.env.BATCH_SIZE
  ? parseInt(process.env.BATCH_SIZE)
  : 500;
const mongoUri = process.env.MONGO_URI!;

export { port, start, end, batchSize, mongoUri };

import { query } from 'indexer-utils';

const start = process.env.START_BLOCK ? parseInt(process.env.START_BLOCK) : 0;
const end = query.tokenActivity.latestBlock;
const batchSize = process.env.BATCH_SIZE
  ? parseInt(process.env.BATCH_SIZE)
  : 1000;

const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

export { start, end, host, port, database, password, user, query, batchSize};
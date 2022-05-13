import 'dotenv/config';
import { Client } from 'pg';
import { graphqlServer, processor } from 'indexer-utils';
import {
  batchSize,
  end,
  host,
  port,
  start,
  user,
  password,
  database,
} from './config';
import handler from './handler';
import createSchema from './create-schema';

async function run() {
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
  });
  await client.connect();
  await createSchema(client);

  processor(start, end, batchSize, handler(client));
}

run();

import 'dotenv/config';
import mongoose from 'mongoose';
import schema from './schema';
import { graphqlServer, processor } from 'indexer-utils';
import handler from './handler';
import { batchSize, end, mongoUri, port, start } from './config';

async function run() {
  await mongoose.connect(mongoUri);

  processor(start, end, batchSize, handler);

  if (typeof end !== 'number') {
    graphqlServer(schema, port);
  }
}

run();

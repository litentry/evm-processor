import 'dotenv/config';
import mongoose from 'mongoose';
import { graphqlServer, processor } from 'indexer-utils';
import schema from './schema';
import { port, start, end, batchSize, mongoUri } from './config';
import handler from './handler';

(async () => {
  await mongoose.connect(mongoUri);

  processor(start, end, batchSize, handler);

  if (typeof end !== 'number') {
    graphqlServer(schema, port);
  }
})();

import 'dotenv/config';
import { graphqlServer, processor } from 'indexer-utils';
import mongoose from 'mongoose';
import config from './config';
import handler from './handler';
import schema from './schema';

(async () => {
  await mongoose.connect(config.mongoUri);

  processor(config.start, config.end, config.batchSize, handler);

  if (typeof config.end !== 'number') {
    graphqlServer(schema, config.port);
  }
})();

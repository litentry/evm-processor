import 'dotenv/config';
import mongoose from 'mongoose';
import { processor } from 'archive-utils';
import config from './config';
import handler from './handler';

(async () => {
  await mongoose.connect(config.mongoUri);

  processor(config.start, config.end, config.batchSize, handler);
})();

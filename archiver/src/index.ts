import 'dotenv/config';
import mongoose from 'mongoose';
import { processor } from 'archive-utils';
import config from './config';
import processBatch from './process-batch';

(async () => {
  await mongoose.connect(config.mongoUri);

  processor(
    config.startBlock || 0,
    config.endBlock || config.web3.eth.getBlockNumber,
    config.batchSize,
    processBatch
  );
})();

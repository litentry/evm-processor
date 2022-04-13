import 'dotenv/config';
import mongoose from 'mongoose';
import { processor } from 'archive-utils';
import config from './config';
import getStartBlock from './get-start-block';
import processBatch from './process-batch';

(async () => {
  await mongoose.connect(config.mongoUri);

  const start = await getStartBlock();

  processor(
    start,
    config.endBlock || config.web3.eth.getBlockNumber,
    config.batchSize,
    processBatch
  );
})();

import mongoose from 'mongoose';
import config from './config';
import getStartBlock from './get-start-block';
import extract from './extract-block';
import load from './load-block';
import { LoadBlock, ExtractBlock } from './types';
import processBatch from './process-batch';

(async () => {
  const { extractBlock, loadBlock } = await tempConfigGetter();

  let batchStartBlock = await getStartBlock();

  while (batchStartBlock <= config.endBlock) {
    let batchEndBlock = batchStartBlock + config.batchSize - 1;
    if (batchEndBlock > config.endBlock) {
      batchEndBlock = config.endBlock;
    }
    await processBatch(batchStartBlock, batchEndBlock, extractBlock, loadBlock);
    console.log(`Processed batch ${batchStartBlock} to ${batchEndBlock}`);

    batchStartBlock = batchEndBlock + 1;
  }

  process.exit(0);
})();

async function tempConfigGetter() {
  let extractBlock: ExtractBlock;
  let loadBlock: LoadBlock;

  if (config.extractType === 'bv') {
    extractBlock = extract.blockVision;
  } else if (config.extractType === 'rpc') {
    extractBlock = extract.rpc;
  } else {
    throw new Error('EXTRACT_TYPE must be "rpc" or "bv"');
  }

  if (config.loadType === 'mongo') {
    if (!config.mongoUri) {
      throw new Error('Load type set as mongo but MONGO_URI not set');
    }
    await mongoose.connect(config.mongoUri);
    loadBlock = load.mongo;
  } else if (config.loadType === 'parquet') {
    loadBlock = load.parquet;
  } else {
    throw new Error('LOAD_TYPE must be "mongo" or "parquet"');
  }

  return {
    extractBlock,
    loadBlock,
  };
}

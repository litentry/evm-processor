import fs from 'fs';
import mongoose from 'mongoose';
import config from './config';
import getStartBlock from './get-start-block';
import load from './load-block';
import clean from './cleanup';
import { LoadBlock, ExtractBlock, Cleanup } from './types';
import processBlockRange from './process-block-range';
import processBlock from './process-block';
import { getParquet } from "./parquet/instance";
import attachHandlers from "./error-handler";

(async () => {
  const {loadBlock} = await getLoadType();
  let chainHeight = await config.web3.eth.getBlockNumber();
  let startBlock = await getStartBlock();

  console.log(`Initial chain height: ${chainHeight}`);
  let lastBlockArchived = await processBlockRange(
    startBlock,
    config.endBlock || chainHeight,
    loadBlock
  );
  console.log(`Caught up to block: ${chainHeight}`);

  if (config.endBlock) {
    return;
  }

  // update chain height
  chainHeight = await config.web3.eth.getBlockNumber();
  console.log(`New chain height: ${chainHeight}`);

  // catch up with chain height then re-check chain height
  while (chainHeight - lastBlockArchived) {
    lastBlockArchived = await processBlockRange(
      lastBlockArchived + 1,
      chainHeight,
      loadBlock
    );
    chainHeight = await config.web3.eth.getBlockNumber();
  }
  console.log(`In sync with with chain height: ${chainHeight}`);

  // todo get new blocks
  config.web3.eth.subscribe('newBlockHeaders', (err, { number }) => {
    processBlock(number, loadBlock);
    console.log(`Processed new block: ${number}`);
    fs.writeFileSync('last-indexed-block', number.toString());
  });
})();

async function getLoadType() {
  let loadBlock: LoadBlock;
  let cleanup: Cleanup;

  if (config.loadType === 'mongo') {
    if (!config.mongoUri) {
      throw new Error('Load type set as mongo but MONGO_URI not set');
    }
    await mongoose.connect(config.mongoUri);
    loadBlock = load.mongo;
    cleanup = clean.mongo;
  } else if (config.loadType === 'parquet') {
    const parquetInstance = getParquet(config.parquet.blocksPerFile);
    loadBlock = load.parquet(parquetInstance);
    cleanup = clean.parquet(parquetInstance);
  } else {
    throw new Error('LOAD_TYPE must be "mongo" or "parquet"');
  }
  attachHandlers(cleanup);
  return {
    loadBlock,
    cleanup
  };
}


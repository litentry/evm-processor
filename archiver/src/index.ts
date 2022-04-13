import fs from 'fs';
import colors from 'colors';
import mongoose from 'mongoose';
import config from './config';
import getStartBlock from './get-start-block';
import load from './load-block';
import processBlock from './process-block';
import processBlockRange from './process-block-range';
import { LoadBlock, Cleanup } from './types';
import { getParquet } from "./parquet/instance";
import attachHandlers from "./error-handler";
import clean from './cleanup';

(async () => {
  const {loadBlock} = await getLoadType();
  let chainHeight = await config.web3.eth.getBlockNumber();
  const startBlock = await getStartBlock();

  console.log(colors.green(`Initial chain height: ${chainHeight}`));
  let lastBlockArchived = await processBlockRange(
    startBlock,
    config.endBlock || chainHeight,
    loadBlock
  );
  console.log(colors.green(`Caught up to block: ${chainHeight}`));

  if (config.endBlock) {
    return;
  }

  // update chain height
  chainHeight = await config.web3.eth.getBlockNumber();
  console.log(colors.green(`New chain height: ${chainHeight}`));

  // catch up with chain height then re-check chain height
  while (chainHeight - lastBlockArchived) {
    lastBlockArchived = await processBlockRange(
      lastBlockArchived + 1,
      chainHeight,
      loadBlock
    );
    chainHeight = await config.web3.eth.getBlockNumber();
  }
  console.log(colors.green(`In sync with with chain height: ${chainHeight}`));

  // todo get new blocks
  config.web3.eth.subscribe('newBlockHeaders', (err, { number }) => {
    console.log(colors.green(`New block in chain: ${number}`));
    processBlock(number, loadBlock);
    fs.writeFileSync('last-indexed-block', number.toString());
  });
})();

async function getLoadType() {
  let loadBlock: LoadBlock;
  let cleanup: Cleanup = async () => undefined;

  if (config.loadType === 'mongo') {
    if (!config.mongoUri) {
      throw new Error('Load type set as mongo but MONGO_URI not set');
    }
    await mongoose.connect(config.mongoUri);
    loadBlock = load.mongo;
  } else if (config.loadType === 'parquet') {
    const parquetInstance = getParquet(config.parquet.blocksPerFile);
    loadBlock = load.parquet(parquetInstance);
    cleanup = clean.parquet(parquetInstance);
  } else if (config.loadType === 'postgres') {
    loadBlock = load.postgres;
  } else {
    throw new Error('LOAD_TYPE must be "mongo", "parquet" or "postgres"');
  }
  attachHandlers(cleanup);
  return {
    loadBlock,
    cleanup
  };
}


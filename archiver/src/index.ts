import fs from 'fs';
import colors from 'colors';
import mongoose from 'mongoose';
import config from './config';
import getStartBlock from './get-start-block';
import load from './load-block';
import processBlock from './process-block';
import processBlockRange from './process-block-range';

(async () => {
  await mongoose.connect(config.mongoUri);
  let chainHeight = await config.web3.eth.getBlockNumber();
  let startBlock = await getStartBlock();

  console.log(colors.green(`Initial chain height: ${chainHeight}`));
  let lastBlockArchived = await processBlockRange(
    startBlock,
    config.endBlock || chainHeight,
    load.mongo
  );
  console.log(colors.green(`Caught up to block: ${chainHeight}`));

  if (config.endBlock) {
    process.exit(0);
  }

  // update chain height
  chainHeight = await config.web3.eth.getBlockNumber();
  console.log(colors.green(`New chain height: ${chainHeight}`));

  // catch up with chain height then re-check chain height
  while (chainHeight - lastBlockArchived) {
    lastBlockArchived = await processBlockRange(
      lastBlockArchived + 1,
      chainHeight,
      load.mongo
    );
    chainHeight = await config.web3.eth.getBlockNumber();
  }
  console.log(colors.green(`In sync with with chain height: ${chainHeight}`));

  // todo get new blocks
  config.web3.eth.subscribe('newBlockHeaders', (err, { number }) => {
    console.log(colors.green(`New block in chain: ${number}`));
    processBlock(number, load.mongo);
    fs.writeFileSync('last-indexed-block', number.toString());
  });
})();

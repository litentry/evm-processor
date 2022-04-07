import config from './config';
import processBatch from './process-batch';
import { LoadBlock } from './types';

export default async function processBlockRange(
  startBlock: number,
  endBlock: number,
  loadBlock: LoadBlock
) {
  let batchStartBlock = startBlock;
  while (batchStartBlock <= endBlock) {
    let batchEndBlock = batchStartBlock + config.batchSize - 1;

    if (batchEndBlock > endBlock) {
      batchEndBlock = endBlock;
    }
    await processBatch(batchStartBlock, batchEndBlock, loadBlock);

    batchStartBlock = batchEndBlock + 1;
  }
  return batchStartBlock - 1;
}

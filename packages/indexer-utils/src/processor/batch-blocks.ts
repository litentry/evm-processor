import fs from 'fs';
import { BatchHandler } from '../types/process';

export default async function batchBlocks(
  startBlock: number,
  endBlock: number,
  batchSize: number,
  batchHandler: BatchHandler,
) {
  let batchStartBlock = startBlock;

  while (batchStartBlock <= endBlock) {
    let batchEndBlock = batchStartBlock + batchSize - 1;

    if (batchEndBlock > endBlock) {
      batchEndBlock = endBlock;
    }

    await batchHandler(batchStartBlock, batchEndBlock);

    batchStartBlock = batchEndBlock + 1;

    fs.writeFileSync('last-indexed-block', batchEndBlock.toString());
  }

  return batchStartBlock - 1;
}

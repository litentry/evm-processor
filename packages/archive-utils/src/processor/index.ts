import fs from 'fs';
import colors from 'colors';
import batchBlocks from './batch-blocks';

export default async function processor(
  start: number,
  end: number | (() => Promise<number>),
  batchSize: number,
  batchHandler: (start: number, end: number) => Promise<void>
) {
  const stream = typeof end !== 'number';

  let endBlock = stream ? await end() : end;
  const startBlock = getStartBlock(start);

  if (stream) {
    console.log(colors.green(`Initial chain height: ${endBlock}`));
  }

  let lastBlockIndexed = await batchBlocks(
    startBlock,
    endBlock,
    batchSize,
    batchHandler
  );

  console.log(colors.green(`Caught up to block: ${endBlock}`));

  if (!stream) {
    process.exit(0);
  }

  endBlock = await end();

  console.log(colors.green(`New chain height: ${endBlock}`));

  // catch up with chain height then re-check chain height
  while (endBlock - lastBlockIndexed) {
    lastBlockIndexed = await batchBlocks(
      lastBlockIndexed + 1,
      endBlock,
      batchSize,
      batchHandler
    );
    endBlock = await end();
  }
  console.log(colors.green(`In sync with with chain height: ${endBlock}`));

  // subscribe
  let busy = false; // in case a batch handler takes longer than the interval
  setInterval(async () => {
    if (busy) {
      return;
    }

    busy = true;
    endBlock = await end();

    if (endBlock - lastBlockIndexed) {
      lastBlockIndexed = await batchBlocks(
        lastBlockIndexed + 1,
        endBlock,
        batchSize,
        batchHandler
      );
    }

    busy = false;
  }, 5000);
}

function getStartBlock(startBlock: number) {
  if (fs.existsSync('last-indexed-block')) {
    const file = fs.readFileSync('last-indexed-block');
    if (file.toString()) {
      return parseInt(file.toString()) + 1;
    }
  }

  return startBlock;
}

import colors from 'colors';
import batchBlocks from './batch-blocks';

export default async function asyncProcessor(
  start: number,
  end: number | (() => Promise<number>),
  batchSize: number,
  batchHandler: (start: number, end: number) => Promise<void>
) {
  const stream = typeof end !== 'number';

  let lastBlockInRange = stream ? await end() : end;

  if (stream) {
    console.log(colors.green(`Initial chain height: ${lastBlockInRange}`));
  }

  let lastBlockIndexed = await batchBlocks(
    start,
    lastBlockInRange,
    batchSize,
    batchHandler
  );

  console.log(colors.green(`Caught up to block: ${lastBlockInRange}`));

  if (!stream) {
    process.exit(0);
  }

  lastBlockInRange = await end();

  console.log(colors.green(`New chain height: ${lastBlockInRange}`));

  // catch up with chain height then re-check chain height
  while (lastBlockInRange - lastBlockIndexed) {
    lastBlockIndexed = await batchBlocks(
      lastBlockIndexed + 1,
      lastBlockInRange,
      batchSize,
      batchHandler
    );
    lastBlockInRange = await end();
  }
  console.log(
    colors.green(`In sync with with chain height: ${lastBlockInRange}`)
  );

  // subscribe
}

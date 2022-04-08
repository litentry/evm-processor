import fs from 'fs';
import colors from 'colors';
import { LoadBlock } from './types';
import processBlock from './process-block';

export default async function processBatch(
  start: number,
  end: number,
  loadBlock: LoadBlock
) {
  console.time('Batch time');
  const blocks: number[] = [];
  for (let block = start; block <= end; block++) blocks.push(block);

  await Promise.all(
    blocks.map(async (number) => {
      await processBlock(number, loadBlock);
    })
  );
  fs.writeFileSync('last-indexed-block', end.toString());
  console.log(colors.blue(`Processed batch ${start} to ${end}`));
  console.timeEnd('Batch time');
  console.log('\n');
}

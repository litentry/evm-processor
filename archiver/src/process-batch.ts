import { ExtractBlock, LoadBlock } from './types';
import transformBlock from './transform-block';

export default async function processBatch(
  start: number,
  end: number,
  extractBlock: ExtractBlock,
  loadBlock: LoadBlock
) {
  const blocks: number[] = [];

  for (let block = start; block <= end; block++) {
    blocks.push(block);
  }

  console.time('Batch time');
  await Promise.all(
    blocks.map(async (block) => {
      const blockData = await extractBlock(block);
      const transformedData = transformBlock(blockData);
      await loadBlock(transformedData);
    })
  );
  console.timeEnd('Batch time');
}

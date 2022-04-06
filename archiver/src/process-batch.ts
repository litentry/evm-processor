import { ExtractBlock, LoadBlock } from './types';
import transformBlock from './transform-block';

export default async function processBatch(
  start: number,
  end: number,
  extractBlock: ExtractBlock,
  loadBlock: LoadBlock
) {
  const blocks: number[] = [];
  for (let block = start; block <= end; block++) blocks.push(block);

  await Promise.all(
    blocks.map(async (block) => {
      const data = await extractBlock(block);
      const transformedData = transformBlock(data);
      console.log(
        `${transformedData.transactions.length} transactions in block ${block}`
      );
      console.log(`${transformedData.logs.length} logs in block ${block}`);
      await loadBlock(transformedData);
    })
  );
}

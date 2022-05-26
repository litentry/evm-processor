import { repository } from 'indexer-utils';
import extractBlock from './extract-block';
import loadBlock from './load-block';
import transformBlock from './transform-block';

export default async function indexer(start: number, end: number) {
  const blocks: number[] = [];
  for (let block = start; block <= end; block++) {
    blocks.push(block);
  }

  try {
    // Extract batch
    const extractedBlocks = await Promise.all(blocks.map(extractBlock));

    // Transform batch
    const transformedBlocks = extractedBlocks.map(transformBlock);

    // Load batch
    await Promise.all(transformedBlocks.map(loadBlock));

    // Log completion
    await repository.indexedBlockRange.save(start, end);
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to process batch ${start}-${end}`);
  }
}

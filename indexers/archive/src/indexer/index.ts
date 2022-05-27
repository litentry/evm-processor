import { metrics, monitoring } from 'indexer-monitoring';
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
    monitoring.markStart(metrics.extractBlock);
    const extractedBlocks = await Promise.all(blocks.map(extractBlock));
    monitoring.markEnd(metrics.extractBlock);

    // Transform batch
    monitoring.markStart(metrics.transformBlock);
    const transformedBlocks = extractedBlocks.map(transformBlock);
    monitoring.markEnd(metrics.transformBlock);

    // Load batch
    monitoring.markStart(metrics.loadBlock);
    await Promise.all(transformedBlocks.map(loadBlock));
    monitoring.markEnd(metrics.loadBlock);

    // Log completion
    await repository.indexedBlockRange.save(start, end);
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to process batch ${start}-${end}`);
  } finally {
    monitoring.measure(metrics.extractBlock);
    monitoring.measure(metrics.transformBlock);
    monitoring.measure(metrics.loadBlock);
    monitoring.measure(
      metrics.fullWorkerProcess,
      metrics.extractBlock,
      metrics.loadBlock,
    );
  }
}

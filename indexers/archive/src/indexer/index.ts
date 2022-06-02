import { metrics, monitoring } from 'indexer-monitoring';
import { repository } from 'indexer-utils';
import throat from 'throat';
import extractBlock from './extract-block';
import loadBlock from './load-block';
import transformBlock from './transform-block';

const throttle = throat(5);

export default async function indexer(start: number, end: number) {
  const blocks: number[] = [];
  for (let block = start; block <= end; block++) {
    blocks.push(block);
  }

  // Extract batch
  console.time('extract');
  monitoring.markStart(metrics.extractBlock);
  const extractedBlocks = await Promise.all(blocks.map(extractBlock));
  monitoring.markEnd(metrics.extractBlock);
  console.timeEnd('extract');

  // Transform batch
  console.time('transform');
  monitoring.markStart(metrics.transformBlock);
  const transformedBlocks = extractedBlocks.map(transformBlock);
  monitoring.markEnd(metrics.transformBlock);
  console.timeEnd('transform');

  // Load batch
  console.time('load');
  monitoring.markStart(metrics.loadBlock);
  await Promise.all(transformedBlocks.map(loadBlock));
  transformedBlocks.map((block) =>
    throttle(async () => {
      await loadBlock(block);
    }),
  );
  monitoring.markEnd(metrics.loadBlock);
  console.timeEnd('load');

  // Log completion
  await repository.indexedBlockRange.save(start, end);

  // Prepare metrics
  monitoring.measure(metrics.extractBlock);
  monitoring.measure(metrics.transformBlock);
  monitoring.measure(metrics.loadBlock);
  monitoring.measure(
    metrics.fullWorkerProcess,
    metrics.extractBlock,
    metrics.loadBlock,
  );
}

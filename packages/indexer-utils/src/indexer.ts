import { metrics, monitoring } from 'indexer-monitoring';
import * as repository from './repository';

export default async function indexer<Extracted, Transformed>(
  startBlock: number,
  endBlock: number,
  extract: (startBlock: number, endBlock: number) => Promise<Extracted>,
  transform: (data: Extracted) => Promise<Transformed> | Transformed,
  load: (data: Transformed) => Promise<void>,
) {
  console.time('extract');
  monitoring.markStart(metrics.extractBlock);
  const txs = await extract(startBlock, endBlock);
  monitoring.markEnd(metrics.extractBlock);
  console.timeEnd('extract');

  console.time('transform');
  monitoring.markStart(metrics.transformBlock);
  const transformed = await transform(txs);
  monitoring.markEnd(metrics.transformBlock);
  console.timeEnd('transform');

  console.time('load');
  monitoring.markStart(metrics.loadBlock);
  await load(transformed);
  monitoring.markEnd(metrics.loadBlock);
  console.timeEnd('load');

  await repository.indexedBlockRange.save(startBlock, endBlock);

  monitoring.measure(metrics.extractBlock);
  monitoring.measure(metrics.transformBlock);
  monitoring.measure(metrics.loadBlock);
}

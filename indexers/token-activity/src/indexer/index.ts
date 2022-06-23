import { metrics, monitoring } from 'indexer-monitoring';
import { repository } from 'indexer-utils';
import extract from './extract';
import load from './load';
import transform from './transform';

export default async function indexer(startBlock: number, endBlock: number) {
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

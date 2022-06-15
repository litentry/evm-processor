import { query, repository } from 'indexer-utils';
import { metrics, monitoring } from 'indexer-monitoring';
import handleContractCreation from './handle-contract-creation';

export default async function indexer(startBlock: number, endBlock: number) {
  console.time('extract');
  monitoring.markStart(metrics.extractBlock);
  const txs = await query.archive.contractCreationTransactions({
    startBlock,
    endBlock,
    properties: [
      'receiptContractAddress',
      'from',
      'blockNumber',
      'blockTimestamp',
      'input',
      'receiptStatus',
    ],
  });
  monitoring.markEnd(metrics.extractBlock);
  console.timeEnd('extract');

  // Transform & load batch
  console.time('load');
  monitoring.markStart(metrics.loadBlock);
  const results = await Promise.allSettled(txs.map(handleContractCreation));
  monitoring.markEnd(metrics.loadBlock);
  console.timeEnd('load');

  const rejected = results.filter((result) => result.status === 'rejected');
  if (rejected.length) {
    throw rejected;
  }

  await repository.indexedBlockRange.save(startBlock, endBlock);

  monitoring.measure(metrics.extractBlock);
  monitoring.measure(metrics.loadBlock);
  monitoring.measure(
    metrics.fullWorkerProcess,
    metrics.extractBlock,
    metrics.loadBlock,
  );
}

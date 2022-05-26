import colors from 'colors';
import { metrics, monitoring } from 'indexer-monitoring';
import { repository } from 'indexer-utils';
import extractBlock from './extract-block';
import loadBlock from './load-block';
import transformBlock from './transform-block';

export default async function indexer(start: number, end: number) {
  console.log(`Processing block batch ${start}-${end}`);

  const blocks: number[] = [];
  for (let block = start; block <= end; block++) {
    blocks.push(block);
  }

  try {
    console.time(`Batch time ${start}-${end}`);
    await Promise.all(
      blocks.map(async (number) => {
        monitoring.markStart(metrics.extractBlock);
        const data = await extractBlock(number);
        monitoring.markEnd(metrics.extractBlock);

        monitoring.markStart(metrics.transformBlock);
        const transformedData = transformBlock(data);
        monitoring.markEnd(metrics.transformBlock);

        monitoring.markStart(metrics.loadBlock);
        await loadBlock(transformedData);
        monitoring.markEnd(metrics.loadBlock);

        console.log(
          `Contract creations: ${transformedData.contractCreationTransactions.length}`,
        );
        console.log(
          `Contract interactions: ${transformedData.contractTransactions.length}`,
        );
        console.log(
          `Native token transfers: ${transformedData.nativeTokenTransactions.length}`,
        );
      }),
    );
    console.log(colors.blue(`Processed batch ${start} to ${end}`));
    console.timeEnd(`Batch time ${start}-${end}`);

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

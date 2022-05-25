import colors from 'colors';
import { monitoring } from 'indexer-monitoring';
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
        monitoring.mark('start-extract-block');
        const data = await extractBlock(number);
        monitoring.mark('end-extract-block');

        monitoring.mark('start-transform-block');
        const transformedData = transformBlock(data);
        monitoring.mark('end-extract-block');

        monitoring.mark('start-load-block');
        await loadBlock(transformedData);
        monitoring.mark('end-load-block');

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
    monitoring.measure('start-extract-block', 'end-extract-block', {
      functionName: 'extractBlock',
      metricName: 'timer',
      description: 'Elapsed time for the extractBlock function',
    });
    monitoring.measure('start-transform-block', 'end-transform-block', {
      functionName: 'transformBlock',
      metricName: 'timer',
      description: 'Elapsed time for the transformBlock function',
    });
    monitoring.measure('start-load-block', 'end-load-block', {
      functionName: 'loadBlock',
      metricName: 'timer',
      description: 'Elapsed time for the loadBlock function',
    });
  }
}

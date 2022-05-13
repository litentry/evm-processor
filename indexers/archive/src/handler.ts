import config from '@app/config';
import colors from 'colors';
import mongoose from 'mongoose';
import { startTimer } from 'monitoring';
import extractBlock from './extract-block';
import loadBlock from './load-block';
import transformBlock from './transform-block';

export default async function processBatch(start: number, end: number) {
  console.log(`Processing block batch ${start}-${end}`);

  const blocks: number[] = [];
  for (let block = start; block <= end; block++) {
    blocks.push(block);
  }

  try {
    console.time(`Batch time ${start}-${end}`);
    await Promise.allSettled(
      blocks.map(async (number) => {
        const extractBlockEndTimer = startTimer({
          functionName: 'extractBlock',
          metricName: 'timer',
          description: 'Elapsed time for the extractBlock function',
        });
        const data = await extractBlock(number);
        extractBlockEndTimer();

        const transformBlockEndTimer = startTimer({
          functionName: 'transformBlock',
          metricName: 'timer',
          description: 'Elapsed time for the transformBlock function',
        });
        const transformedData = transformBlock(data);
        transformBlockEndTimer();

        await loadBlock(transformedData);

        console.log(
          `Contract creations: ${transformedData.contractCreationTransactions.length}`
        );
        console.log(
          `Contract interactions: ${transformedData.contractTransactions.length}`
        );
        console.log(
          `Native token transfers: ${transformedData.nativeTokenTransactions.length}`
        );
      })
    );
    console.log(colors.blue(`Processed batch ${start} to ${end}`));
    console.timeEnd(`Batch time ${start}-${end}`);
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to process batch ${start}-${end}`);
  }
}

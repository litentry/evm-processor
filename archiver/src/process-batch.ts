import fs from 'fs';
import colors from 'colors';
import transformBlock from './transform-block';
import extractBlock from './extract-block';
import loadBlock from './load-block/mongo';

export default async function processBatch(start: number, end: number) {
  console.time('Batch time');

  const blocks: number[] = [];
  for (let block = start; block <= end; block++) blocks.push(block);

  await Promise.all(
    blocks.map(async (number) => {
      const data = await extractBlock(number);

      const transformedData = transformBlock(data);

      await loadBlock(transformedData);

      console.log(`Processed block ${number}`);
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

  fs.writeFileSync('last-indexed-block', end.toString());

  console.log(colors.blue(`Processed batch ${start} to ${end}`));
  console.timeEnd('Batch time');
  console.log('\n');
}

import colors from 'colors';
import extractBlock from './extract-block';
import loadBlock from './load-block';
import transformBlock from './transform-block';

export default async function processBatch(start: number, end: number) {
  // console.time('Batch time');
  console.log(`Processing batch`);

  const blocks: number[] = [];
  for (let block = start; block <= end; block++) blocks.push(block);

  await Promise.all(
    blocks.map(async (number) => {
      console.log(`Processing block ${number}`);
      const data = await extractBlock(number);

      console.log(`transformBlock`);
      const transformedData = transformBlock(data);

      console.log(`loadBlock`);
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

  console.log(colors.blue(`Processed batch ${start} to ${end}`));
  // console.timeEnd('Batch time');
  console.log('\n');
}

import colors from 'colors';
import extractBlock from './extract-block';
import loadBlock from './load-block';
import transformBlock from './transform-block';
import mongoose from "mongoose";
import config from "@app/config";

export default async function processBatch(start: number, end: number) {
  //console.time('Batch time');

  await mongoose.connect(config.mongoUri);

  const blocks: number[] = [];
  for (let block = start; block <= end; block++) blocks.push(block);

  await Promise.all(
    blocks.map(async (number) => {
      const data = await extractBlock(number);

      const transformedData = transformBlock(data);

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
  //console.timeEnd('Batch time');
  console.log('\n');
}

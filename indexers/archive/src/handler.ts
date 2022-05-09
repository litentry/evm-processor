import colors from 'colors';
import extractBlock from './extract-block';
import loadBlock from './load-block';
import transformBlock from './transform-block';
import mongoose from "mongoose";
import config from "@app/config";

export default async function processBatch(start: number, end: number) {
  let failed = false;

  console.log(`Processing block batch ${start}-${end}`);
  const blocks: number[] = [];
  for (let block = start; block <= end; block++) blocks.push(block);
  console.time('Batch time');

  try {
    await mongoose.connect(config.mongoUri);

    await Promise.all(
      blocks.map(async (number) => {
        console.log(`Processing block ${number}`);
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
    console.log('\n');
  } catch (e) {
    console.error(e);
    failed = true;
  }

  console.timeEnd('Batch time');
  await mongoose.disconnect();

  if (failed) {
    throw new Error(`Failed with batch ${start}-${end}`);
  }
}

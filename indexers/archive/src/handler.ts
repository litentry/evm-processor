import config from "@app/config";
import colors from 'colors';
import mongoose from "mongoose";
import { startTimer } from 'monitoring';
import extractBlock from './extract-block';
import loadBlock from './load-block';
import transformBlock from './transform-block';

export default async function processBatch(start: number, end: number) {
  await mongoose.connect(config.mongoUri);

  const blocks: number[] = [];
  for (let block = start; block <= end; block++) blocks.push(block);

  await Promise.all(
    blocks.map(async (number) => {

      let end = startTimer({
        message: "",
        level: "info",
        functionId: "abc",
        functionName: "extractBlock",
        chain: "some",
        metricName: "histo",
        description: "asd"
      });
      const data = await extractBlock(number);
      end();

      end = startTimer({
        message: "",
        level: "info",
        functionId: "abc",
        functionName: "transformBlock",
        chain: "some",
        metricName: "histo",
        description: "asd"
      });
      const transformedData = transformBlock(data);
      end();

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
}
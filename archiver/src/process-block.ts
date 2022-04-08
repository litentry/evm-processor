import { LoadBlock } from './types';
import transformBlock from './transform-block';
import extractBlock from './extract-block';

export default async function processBlock(
  number: number,
  loadBlock: LoadBlock
) {
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
}

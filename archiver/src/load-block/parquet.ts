import { LoadBlock } from '../types';
import { ParquetInstance } from '../parquet/instance';
import { convert } from "../parquet/schema";

export const withInstance = (instance: ParquetInstance): LoadBlock => {
  return async ({
    transactions,
    logs,
    contractSignatures,
    block,
  }) => {

    const blockNumber = block.number;

    if (blockNumber === undefined) {
      console.warn('No data');
      return Promise.resolve();
    }

    const parquetBlockSet = await instance.ensureOpen(block.number);
    console.log(`Writing batch for ${block.number}: logs ${JSON.stringify(logs).length}`);

    await parquetBlockSet.blocks.appendRow(convert(block, parquetBlockSet.blocks.schema));

    parquetBlockSet.logs.setRowGroupSize(logs.length);
    for (const i of logs) {
     await parquetBlockSet.logs.appendRow(convert(i, parquetBlockSet.logs.schema));
    }
    parquetBlockSet.contractSignatures.setRowGroupSize(logs.length);
    for (const i of contractSignatures) {
      await parquetBlockSet.contractSignatures.appendRow(convert(i, parquetBlockSet.contractSignatures.schema));
    }
    parquetBlockSet.transactions.setRowGroupSize(logs.length);
    for (const i of transactions) {
      await parquetBlockSet.transactions.appendRow(convert(i, parquetBlockSet.transactions.schema));
    }
    parquetBlockSet.blocks.setRowGroupSize(1);
    await parquetBlockSet.blocks.appendRow(convert(block, parquetBlockSet.blocks.schema));
  }
}


export default withInstance;

import { LoadBlock } from '../types';
import { ParquetInstance } from '../parquet/instance';

export const withInstance = (instance: ParquetInstance): LoadBlock => {
  return async ({
    transactions,
    logs,
    contractSignatures,
    block,
  }) => {

    const blockNumber =
      transactions[0]?.blockNumber ||
      logs[0]?.blockNumber ||
      contractSignatures[0]?.blockNumber;

    if (blockNumber === undefined) {
      console.warn('No data');
      return Promise.resolve();
    }

    const parquetBlockSet = await instance.ensureOpen(blockNumber);
    console.log(`Writing batch for ${blockNumber}: logs ${JSON.stringify(logs).length}`);

    for (const i of logs) {
     await parquetBlockSet.logs.appendRow(i);
    }
    for (const i of contractSignatures) {
      await parquetBlockSet.contractSignatures.appendRow(i);
    }
    for (const r of transactions) {
      const s = {
        ...r,
        value: r.value.toString(),
        gasUsed: r.gasUsed.toString(),
        cumulativeGasUsed: r.cumulativeGasUsed.toString(),
        effectiveGasPrice: r.effectiveGasPrice.toString(),
      }
      await parquetBlockSet.transactions.appendRow(s);
    }
  }
}


export default withInstance;

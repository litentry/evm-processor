import { LoadBlock } from '../types';
import { ParquetInstance } from '../parquet/instance';

export const withInstance = (instance: ParquetInstance): LoadBlock => {
  return async ({
    transactions,
    logs,
    contractSignatures,
    block,
  }) => {
    instance.appendRow(block, block.number, "blocks");
    for (const log of logs) {
      instance.appendRow(log, block.number, "logs");
    }
    for (const contractSignature of contractSignatures) {
      instance.appendRow(contractSignature, block.number, "contractSignatures");
    }
    for (const transaction of transactions) {
      instance.appendRow(transaction, block.number, "transactions");
    }
  }
}


export default withInstance;

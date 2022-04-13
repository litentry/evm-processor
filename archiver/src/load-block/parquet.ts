import { LoadBlock } from '../types';
import { ParquetInstance } from '../parquet/instance';

export const withInstance = (instance: ParquetInstance): LoadBlock => {
  return async ({
                  nativeTokenTransactions,
                  contractCreationTransactions,
                  contractTransactions,
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
    for (const transaction of contractTransactions) {
      instance.appendRow(transaction, block.number, "contractTransactions");
    }
    for (const transaction of nativeTokenTransactions) {
      instance.appendRow(transaction, block.number, "nativeTokenTransactions");
    }
    for (const transaction of contractCreationTransactions) {
      instance.appendRow(transaction, block.number, "contractCreationTransactions");
    }
  }
}


export default withInstance;

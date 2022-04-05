import config from './config';
import { TransactionModel } from './models';

export default async function getStartBlock() {
  if (config.startBlock) {
    // TODO we need to scan existing blocks in the range to avoid duplication
    return config.startBlock;
  }

  // TODO add parquet query option
  const res = await TransactionModel.find({})
    .sort('-blockNumber')
    .limit(1)
    .exec();

  if (res[0]) {
    return res[0].blockNumber + 1;
  }

  return 0;
}

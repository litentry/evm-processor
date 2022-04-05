import config from './config';
import { TransactionModel } from './models';

export default async function getStartBlock() {
  if (config.startBlock) {
    // TODO? maybe add a scan to check for existing blocks and suggest a delete
    return config.startBlock;
  }

  // TODO? replace with parquet query
  const res = await TransactionModel.find({})
    .sort('-blockNumber')
    .limit(1)
    .exec();

  if (res[0]) {
    return res[0].blockNumber + 1;
  }

  return 0;
}

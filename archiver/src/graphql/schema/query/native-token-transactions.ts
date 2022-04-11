import { FilterQuery } from 'mongoose';
import { NativeTokenTransaction } from 'archive-utils';
import { NativeTokenTransactionModel } from '../../../models';
import maxRange from '../../max-range';

export default async function nativeTokenTransactions(
  _: any,
  {
    startBlock,
    endBlock,
    from,
    to,
  }: {
    startBlock: number;
    endBlock: number;
    from?: string;
    to?: string;
  }
) {
  maxRange('nativeTokenTransactions', startBlock, endBlock);

  const filter: FilterQuery<NativeTokenTransaction> = {
    blockNumber: {
      $gte: startBlock,
      $lte: endBlock,
    },
  };

  if (from) {
    filter.from = from;
  }

  if (to) {
    filter.to = to;
  }

  const results = await NativeTokenTransactionModel.find(filter).sort({
    blockNumber: 1,
    transactionIndex: 1,
  });

  return results;
}

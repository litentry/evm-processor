import { FilterQuery } from 'mongoose';
import { Types } from 'archive-utils';
import { ContractTransactionModel } from '../../../models';
import maxRange from '../../max-range';

export default async function contractTransactions(
  _: any,
  {
    startBlock,
    endBlock,
    methodId,
    contractAddress,
  }: {
    startBlock: number;
    endBlock: number;
    methodId?: string;
    contractAddress?: string;
  }
) {
  maxRange('contractTransactions', startBlock, endBlock);

  const filter: FilterQuery<Types.Archive.ContractTransaction> = {
    blockNumber: {
      $gte: startBlock,
      $lte: endBlock,
    },
  };

  if (methodId) {
    filter.methodId = methodId;
  }

  if (contractAddress) {
    filter.to = contractAddress;
  }

  const results = await ContractTransactionModel.find(filter).sort({
    blockNumber: 1,
    transactionIndex: 1,
  });

  return results;
}

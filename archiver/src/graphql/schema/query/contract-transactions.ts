import { FilterQuery } from 'mongoose';
import { ContractTransaction } from 'archive-utils';
import { ContractTransactionModel, LogModel } from '../../../models';
import maxRange from '../../max-range';

export default async function contractTransactions(
  _: any,
  {
    startBlock,
    endBlock,
    methodId,
    contractAddress,
    withLogs,
  }: {
    startBlock: number;
    endBlock: number;
    methodId?: string;
    contractAddress?: string;
    withLogs?: boolean;
  }
) {
  maxRange('contractTransactions', startBlock, endBlock);

  const filter: FilterQuery<ContractTransaction> = {
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

  if (!withLogs) {
    return results;
  }

  const logs = await LogModel.find({
    blockNumber: {
      $gte: startBlock,
      $lte: endBlock,
    },
    transactionHash: {
      $in: results.map((tx) => tx.hash),
    },
  }).sort({
    blockNumber: 1,
    logIndex: 1,
  });
}

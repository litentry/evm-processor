import lodash from 'lodash';
import { FilterQuery } from 'mongoose';
import { ContractTransaction } from 'archive-utils';
import { ContractTransactionModel, LogModel } from '../../../models';
import maxRange from '../../max-range';

export default async function contractTransactionsWithLogs(
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
  maxRange('contractTransactionsWithLogs', startBlock, endBlock);

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

  const txs = await ContractTransactionModel.find(filter).sort({
    blockNumber: 1,
    transactionIndex: 1,
  });

  const logs = await LogModel.find({
    blockNumber: {
      $gte: startBlock,
      $lte: endBlock,
    },
    transactionHash: {
      $in: txs.map((tx) => tx.hash),
    },
  }).sort({
    blockNumber: 1,
    logIndex: 1,
  });

  const logsByTx = lodash.groupBy(logs, 'transactionHash');

  return txs.map((tx) => ({
    ...tx.toJSON(),
    logs: (logsByTx[tx.hash] || []).map((log) => log.toJSON()),
  }));
}

import { FilterQuery } from 'mongoose';
import { Log } from 'archive-utils';
import { LogModel } from '../../../models';
import maxRange from '../../max-range';

export default async function logs(
  _: any,
  {
    startBlock,
    endBlock,
    eventId,
    transactionHash,
    contractAddress,
  }: {
    startBlock: number;
    endBlock: number;
    eventId?: string;
    transactionHash?: string;
    contractAddress?: string;
  }
) {
  maxRange('logs', startBlock, endBlock);

  const filter: FilterQuery<Log> = {
    blockNumber: {
      $gte: startBlock,
      $lte: endBlock,
    },
  };

  if (eventId) {
    filter.topic0 = eventId;
  }

  if (contractAddress) {
    filter.address = contractAddress;
  }

  if (transactionHash) {
    filter.transactionHash = transactionHash;
  }

  const results = await LogModel.find(filter).sort({
    blockNumber: 1,
    logIndex: 1,
  });

  return results;
}

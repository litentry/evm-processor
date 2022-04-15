import { Types } from 'archive-utils';
import { FilterQuery } from 'mongoose';
import { ContractCreationTransactionModel } from '../../../models';
import maxRange from '../../max-range';

export default async function contractCreationTransactions(
  _: any,
  {
    startBlock,
    endBlock,
    contractAddress,
  }: { startBlock: number; endBlock: number; contractAddress?: string }
) {
  maxRange('contractCreationTransactions', startBlock, endBlock);

  const filter: FilterQuery<Types.Archive.ContractCreationTransaction> = {
    blockNumber: {
      $gte: startBlock,
      $lte: endBlock,
    },
  };

  if (contractAddress) {
    filter.receiptContractAddress = contractAddress;
  }

  const results = await ContractCreationTransactionModel.find(filter).sort({
    blockNumber: 1,
    transactionIndex: 1,
  });

  return results;
}

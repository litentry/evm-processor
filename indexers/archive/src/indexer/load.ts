import { utils } from 'indexer-utils';
import {
  LogModel,
  NativeTokenTransactionModel,
  ContractCreationTransactionModel,
  ContractTransactionModel,
  BlockModel,
} from '../schema';
import { TransformedBlock } from './types';

/**
 * Try bulk insert, if error try bulk delete to avoid partial imports
 *
 * @param transactions
 * @param logs
 * @param contractSignatures
 */
const loadBlock = async ({
  nativeTokenTransactions,
  contractCreationTransactions,
  contractTransactions,
  logs,
  block,
}: TransformedBlock) => {
  try {
    // this is cheaper than an upsert, so do this first & it'll succeed 99.9% of the time, and fall back to an upsert attempt
    const results = await Promise.allSettled([
      BlockModel.create(block),
      NativeTokenTransactionModel.insertMany(nativeTokenTransactions),
      ContractCreationTransactionModel.insertMany(contractCreationTransactions),
      ContractTransactionModel.insertMany(contractTransactions),
      LogModel.insertMany(logs),
    ]);

    const rejected = results.filter((result) => result.status === 'rejected');
    if (rejected.length) {
      throw rejected;
    }
  } catch (e) {
    const results = await Promise.allSettled([
      utils.upsertMongoModels(BlockModel, [block], ['hash']),
      utils.upsertMongoModels(
        NativeTokenTransactionModel,
        nativeTokenTransactions,
        ['hash'],
      ),
      utils.upsertMongoModels(
        ContractCreationTransactionModel,
        contractCreationTransactions,
        ['hash'],
      ),
      utils.upsertMongoModels(ContractTransactionModel, contractTransactions, [
        'hash',
      ]),
      utils.upsertMongoModels(LogModel, logs, ['uniqueIndex']),
    ]);

    const rejected = results.filter((result) => result.status === 'rejected');
    if (rejected.length) {
      console.error('Error in block mongo loader', rejected);
      throw rejected;
    }
  }
};

export default async function load(blocks: TransformedBlock[]) {
  await utils.ensureShardedCollections(
    BlockModel,
    NativeTokenTransactionModel,
    ContractCreationTransactionModel,
    ContractTransactionModel,
    LogModel,
  );

  const results = await Promise.allSettled(blocks.map(loadBlock));

  const rejected = results.filter((result) => result.status === 'rejected');
  if (rejected.length) {
    throw rejected;
  }
}

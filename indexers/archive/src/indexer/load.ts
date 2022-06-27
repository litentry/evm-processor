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
  const results = await Promise.allSettled([
    utils.upsertMongoModels(BlockModel, [block], ['_id']),
    utils.upsertMongoModels(
      NativeTokenTransactionModel,
      nativeTokenTransactions,
      ['_id'],
    ),
    utils.upsertMongoModels(
      ContractCreationTransactionModel,
      contractCreationTransactions,
      ['_id'],
    ),
    utils.upsertMongoModels(ContractTransactionModel, contractTransactions, [
      '_id',
    ]),
    utils.upsertMongoModels(LogModel, logs, ['_id']),
  ]);

  const rejected = results.filter((result) => result.status === 'rejected');
  if (rejected.length) {
    console.error('Error in the mongo load method', JSON.stringify(rejected));
    throw rejected;
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

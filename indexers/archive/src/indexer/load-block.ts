import { utils } from 'indexer-utils';
import {
  LogModel,
  NativeTokenTransactionModel,
  ContractCreationTransactionModel,
  ContractTransactionModel,
  BlockModel,
} from '../schema';
import { LoadBlock } from './types';
import { ensureShardedSchema } from 'indexer-utils/lib/utils/upsert-mongo-models';

/**
 * Try bulk insert, if error try bulk delete to avoid partial imports
 *
 * @param transactions
 * @param logs
 * @param contractSignatures
 */
const mongo: LoadBlock = async ({
  nativeTokenTransactions,
  contractCreationTransactions,
  contractTransactions,
  logs,
  block,
}) => {
  try {
    const results = await Promise.allSettled([
      ensureShardedSchema(BlockModel, NativeTokenTransactionModel, ContractCreationTransactionModel, ContractTransactionModel, LogModel),

      utils.upsertMongoModels(BlockModel, [block], ['number']),
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
      utils.upsertMongoModels(LogModel, logs, [
        'blockNumber',
        'transactionHash',
      ]),
    ]);

    const rejected = results.filter((result) => result.status === 'rejected');
    if (rejected.length) {
      throw rejected;
    }
  } catch (e) {
    console.error('Error in block mongo loader', e);
    throw e;
  }
};

export default mongo;

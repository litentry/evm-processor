import { utils } from 'indexer-utils';
import {
  LogModel,
  NativeTokenTransactionModel,
  ContractCreationTransactionModel,
  ContractTransactionModel,
  BlockModel,
} from './schema';
import { LoadBlock } from './types';

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
    await Promise.allSettled([
      utils.upsertMongoModels(BlockModel, [block], ['number']),
      utils.upsertMongoModels(
        NativeTokenTransactionModel,
        nativeTokenTransactions,
        ['hash']
      ),
      utils.upsertMongoModels(
        ContractCreationTransactionModel,
        contractCreationTransactions,
        ['hash']
      ),
      utils.upsertMongoModels(ContractTransactionModel, contractTransactions, [
        'hash',
      ]),
      utils.upsertMongoModels(LogModel, logs, [
        'blockNumber',
        'transactionHash',
      ]),
    ]);
  } catch (e) {
    console.error('Error in block mongo loader', e);
    throw e;
  }
};

export default mongo;

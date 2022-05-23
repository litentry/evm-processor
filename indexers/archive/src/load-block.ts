import {
  LogModel,
  NativeTokenTransactionModel,
  ContractCreationTransactionModel,
  ContractTransactionModel,
  BlockModel,
} from './schema';
import { LoadBlock } from './types';
import { upsertMongoModels } from './util';

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
      upsertMongoModels(BlockModel, [block], ['number']),
      upsertMongoModels(NativeTokenTransactionModel, nativeTokenTransactions, [
        'hash',
      ]),
      upsertMongoModels(
        ContractCreationTransactionModel,
        contractCreationTransactions,
        ['hash']
      ),
      upsertMongoModels(ContractTransactionModel, contractTransactions, [
        'hash',
      ]),
      upsertMongoModels(LogModel, logs, ['blockNumber', 'transactionHash']),
    ]);
  } catch (e) {
    console.error('Error in block mongo loader', e);
    throw e;
  }
};

export default mongo;

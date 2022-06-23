import { utils } from 'indexer-utils';
import {
  LogModel,
  NativeTokenTransactionModel,
  ContractCreationTransactionModel,
  ContractTransactionModel,
  BlockModel,
} from '../schema';
import { ExtractedBlock, TransformedBlock } from './types';

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

import { utils } from 'indexer-utils';
import { SwapModel } from '../schema';
import { Swap } from './types';

export default async function load(swaps: Swap[]) {
  await utils.ensureShardedCollections(SwapModel);
  try {
    await SwapModel.insertMany(swaps);
  } catch (e) {
    await utils.upsertMongoModels(SwapModel, swaps, ['transactionHash']);
  }
}

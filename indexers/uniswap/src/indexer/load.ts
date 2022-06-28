import { utils } from 'indexer-utils';
import { SwapModel } from '../schema';
import { Swap } from './types';

export default async function load(swaps: Swap[]) {
  await utils.ensureShardedCollections(SwapModel);
  await utils.upsertMongoModels(SwapModel, swaps, ['_id']);
}

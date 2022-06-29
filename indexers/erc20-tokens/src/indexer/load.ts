import { utils } from 'indexer-utils';
import { ERC20TransferModel } from '../schema';
import { ERC20Transfer } from './types';

export default async function load(data: ERC20Transfer[]): Promise<void> {
  await utils.ensureShardedCollections(ERC20TransferModel);
  await utils.upsertMongoModels(ERC20TransferModel, data, ['_id']);
}

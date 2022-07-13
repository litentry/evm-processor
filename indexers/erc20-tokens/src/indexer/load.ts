import { Types, utils } from 'indexer-utils';
import { ERC20TransferModel } from '../schema';

export default async function load(
  data: Types.Erc20.Transfer[],
): Promise<void> {
  await utils.ensureShardedCollections(ERC20TransferModel);
  await utils.upsertMongoModels(ERC20TransferModel, data, ['_id']);
}

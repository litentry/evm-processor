import { utils } from 'indexer-utils';
import {
  MismatchedTransfersModel,
  MissingContractsModel,
  NFTSaleModel,
} from '../schema';
import { TransformedNFTPriceData } from './types';

export default async function load(
  data: TransformedNFTPriceData,
): Promise<void> {
  await utils.ensureShardedCollections(
    NFTSaleModel,
    MissingContractsModel,
    MismatchedTransfersModel,
  );
  await Promise.all([
    utils.upsertMongoModels(NFTSaleModel, data.sales, ['_id']),
    utils.upsertMongoModels(
      MismatchedTransfersModel,
      data.mismatchedTransfers,
      ['_id'],
    ),
    utils.upsertMongoModels(MissingContractsModel, data.missingContracts, [
      '_id',
    ]),
  ]);
}

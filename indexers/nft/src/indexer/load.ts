import { Types, utils } from 'indexer-utils';
import {
  ERC721TokenModel,
  ERC1155TokenModel,
  ERC721TokenTransferModel,
  ERC1155TokenTransferModel,
} from '../schema';
import { TransformedData } from './types';

export default async function load(data: TransformedData): Promise<void> {
  await utils.ensureShardedCollections(
    ERC721TokenModel,
    ERC1155TokenModel,
    ERC721TokenTransferModel,
    ERC1155TokenTransferModel,
  );

  await Promise.all([
    utils.upsertMongoModels(
      ERC721TokenTransferModel,
      data.erc721TokenTransfers,
      ['_id'],
    ),
    utils.upsertMongoModels(
      ERC1155TokenTransferModel,
      data.erc1155TokenTransfers,
      ['_id'],
    ),
    await Promise.all(
      data.erc721Tokens.map(async (doc) => {
        try {
          await ERC721TokenModel.create(doc);
        } catch (e) {
          if (
            (e as Error).message.startsWith(
              'E11000 duplicate key error collection',
            )
          ) {
            await ERC721TokenModel.findOneAndUpdate(
              {
                _id: doc._id,
                lastTransferedBlockNumber: {
                  $lt: doc.lastTransferedBlockNumber, // TODO add tx index here in case an NFT can move twice per block
                },
              },
              {
                owner: doc.owner,
                lastTransferedBlockNumber: doc.lastTransferedBlockNumber,
                lastTransferedBlockTimestamp: doc.lastTransferedBlockTimestamp,
              },
            );
          } else {
            throw e;
          }
        }
      }),
    ),
    await Promise.all(
      data.erc1155Tokens.map(async (doc) => {
        try {
          await ERC1155TokenModel.create(doc);
        } catch (e) {
          if (
            (e as Error).message.startsWith(
              'E11000 duplicate key error collection',
            )
          ) {
            await ERC1155TokenModel.findByIdAndUpdate(doc._id, {
              $inc: {
                quantity: doc.quantity,
              },
            });
          } else {
            throw e;
          }
        }
      }),
    ),
  ]);
}

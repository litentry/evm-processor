import BigNumber from 'bignumber.js';
import { Types, utils } from 'indexer-utils';
import {
  ERC1155TokenModel,
  ERC1155TokenTransferModel,
  ERC721TokenModel,
  ERC721TokenTransferModel,
} from '../schema';
import { TransformedNFTData } from './types';

export default async function load(data: TransformedNFTData): Promise<void> {
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
                  $lt: doc.lastTransferedBlockNumber,
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
            const quantity = await getLockedQuantity(doc._id);
            await ERC1155TokenModel.findByIdAndUpdate(doc._id, {
              quantity: new BigNumber(quantity).plus(doc.quantity).toString(),
              lockedUntil: null,
            });
          } else {
            throw e;
          }
        }
      }),
    ),
  ]);
}

// Poll every second for an unlocked document, then lock it (atomically)
async function getLockedQuantity(_id: string) {
  let doc: Types.Nft.ERC1155Token | null = null;

  while (!doc) {
    doc = await ERC1155TokenModel.findOneAndUpdate(
      {
        _id,
        $or: [
          {
            lockedUntil: {
              $lt: new Date().getTime(),
            },
          },
          {
            lockedUntil: null, // this will match undefined too
          },
        ],
      },
      {
        lockedUntil: new Date().getTime() + 60000,
      },
    );
    if (!doc) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return doc.quantity;
}

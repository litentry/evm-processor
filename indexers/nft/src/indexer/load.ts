import { Types } from 'indexer-utils';
import { ERC721TokenModel, ERC1155TokenModel } from '../schema';

export default async function load(data: {
  nfts: Types.Nft.ERC721Token[];
  sfts: Types.Nft.ERC1155Token[];
}): Promise<void> {
  await Promise.all(
    data.nfts.map(async (doc) => {
      try {
        await ERC721TokenModel.create(doc);
      } catch (e) {
        if (
          (e as Error).message.startsWith(
            'E11000 duplicate key error collection',
          )
        ) {
          await ERC721TokenModel.findOneAndReplace(
            {
              contract: doc.contract,
              tokenId: doc.tokenId,
              lastTransferedBlockNumber: {
                $lt: doc.lastTransferedBlockNumber,
              },
            },
            doc,
          );
        } else {
          throw e;
        }
      }
    }),
  );
  await Promise.all(
    data.sfts.map(async (doc) => {
      try {
        await ERC1155TokenModel.create(doc);
      } catch (e) {
        if (
          (e as Error).message.startsWith(
            'E11000 duplicate key error collection',
          )
        ) {
          await ERC1155TokenModel.findOneAndUpdate(
            {
              contract: doc.contract,
              tokenId: doc.tokenId,
              owner: doc.owner,
              lastTransferedBlockNumber: {
                $lt: doc.lastTransferedBlockNumber,
              },
            },
            {
              contract: doc.contract,
              tokenId: doc.tokenId,
              owner: doc.owner,
              lastTransferedBlockNumber: doc.lastTransferedBlockNumber,
              lastTransferedBlockTimestamp: doc.lastTransferedBlockTimestamp,
              $inc: {
                quantity: doc.quantity,
              },
            },
          );
        } else {
          throw e;
        }
      }
    }),
  );
}

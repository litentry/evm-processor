import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { filter, repository, Types } from 'indexer-utils';
import mongoose from 'mongoose';

// @ts-ignore
interface ERC721TokenTransferDocument
  extends Types.Nft.ERC721TokenTransfer,
    mongoose.Document {}
// @ts-ignore
interface ERC1155TokenTransferDocument
  extends Types.Nft.ERC1155TokenTransfer,
    mongoose.Document {}
// @ts-ignore
interface ERC721TokenDocument
  extends Types.Nft.ERC721Token,
    mongoose.Document {}
// @ts-ignore
interface ERC1155TokenDocument
  extends Types.Nft.ERC1155Token,
    mongoose.Document {}

export const ERC721TokenSchema = new mongoose.Schema<ERC721TokenDocument>({
  _id: String,
  contract: { type: String, required: true },
  tokenId: { type: String, required: true },
  owner: { type: String, required: true },
  lastTransferedBlockNumber: { type: Number, required: true },
  lastTransferedBlockTimestamp: { type: Number, required: true },
  collectionName: String,
});

ERC721TokenSchema.index({ contract: 1 });
ERC721TokenSchema.index({ tokenId: 1 });
ERC721TokenSchema.index({ owner: 1 });

export const ERC721TokenTransferSchema =
  new mongoose.Schema<ERC721TokenTransferDocument>({
    _id: String,
    from: { type: String, required: true },
    to: { type: String, required: true },
    contract: { type: String, required: true },
    tokenId: { type: String, required: true },
    transactionHash: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    blockTimestamp: { type: Number, required: true },
    collectionName: String,
  });

ERC721TokenTransferSchema.index({ from: 1 });
ERC721TokenTransferSchema.index({ to: 1 });
ERC721TokenTransferSchema.index({ contract: 1 });
ERC721TokenTransferSchema.index({ tokenId: 1 });
ERC721TokenTransferSchema.index({ transactionHash: 1 });
ERC721TokenTransferSchema.index({ blockNumber: 1 });

export const ERC1155TokenSchema = new mongoose.Schema<ERC1155TokenDocument>({
  _id: String,
  contract: { type: String, required: true },
  tokenId: { type: String, required: true },
  owner: { type: String, required: true },
  quantity: { type: String, required: true },
  collectionName: String,
  // @ts-ignore
  lockedUntil: Number,
});

ERC1155TokenSchema.index({ contract: 1 });
ERC1155TokenSchema.index({ tokenId: 1 });
ERC1155TokenSchema.index({ owner: 1 });
ERC1155TokenSchema.index({ quantity: 1 }); // quick filter of previously owned NFTs

export const ERC1155TokenTransferSchema =
  new mongoose.Schema<ERC1155TokenTransferDocument>({
    _id: String,
    from: { type: String, required: true },
    to: { type: String, required: true },
    contract: { type: String, required: true },
    tokenId: { type: String, required: true },
    quantity: { type: String, required: true },
    transactionHash: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    blockTimestamp: { type: Number, required: true },
    collectionName: String,
  });

ERC1155TokenTransferSchema.index({ from: 1 });
ERC1155TokenTransferSchema.index({ to: 1 });
ERC1155TokenTransferSchema.index({ contract: 1 });
ERC1155TokenTransferSchema.index({ tokenId: 1 });
ERC1155TokenTransferSchema.index({ transactionHash: 1 });
ERC1155TokenTransferSchema.index({ blockNumber: 1 });

export const ERC721TokenModel = mongoose.model(
  'ERC721Token',
  ERC721TokenSchema,
);

export const ERC721TokenTransferModel = mongoose.model(
  'ERC721TokenTransfer',
  ERC721TokenTransferSchema,
);

export const ERC1155TokenModel = mongoose.model(
  'ERC1155Token',
  ERC1155TokenSchema,
);

export const ERC1155TokenTransferModel = mongoose.model(
  'ERC1155TokenTransfer',
  ERC1155TokenTransferSchema,
);

const ERC721TokenTC = composeMongoose(ERC721TokenModel);
const ERC721TokenTransferTC = composeMongoose(ERC721TokenTransferModel);
const ERC1155TokenTC = composeMongoose(ERC1155TokenModel);
const ERC1155TokenTransferTC = composeMongoose(ERC1155TokenTransferModel);

ERC1155TokenTC.removeField('lockedUntil');

schemaComposer.Query.addFields({
  nftLatestBlock: repository.lastIndexedBlock.query.latestBlock,
  erc721Tokens: ERC721TokenTC.mongooseResolvers.findMany(filter),
  erc721TokenTransfers:
    ERC721TokenTransferTC.mongooseResolvers.findMany(filter),
  erc1155Tokens: ERC1155TokenTC.mongooseResolvers.findMany(filter),
  erc1155TokenTransfers:
    ERC1155TokenTransferTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();

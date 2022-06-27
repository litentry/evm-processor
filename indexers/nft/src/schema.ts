import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import mongoose from 'mongoose';
import { filter, repository, Types } from 'indexer-utils';

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
});

ERC721TokenSchema.index({ contract: 1, tokenId: 1, owner: 1 });

export const ERC1155TokenSchema = new mongoose.Schema<ERC1155TokenDocument>({
  _id: String,
  contract: { type: String, required: true },
  tokenId: { type: String, required: true },
  owner: { type: String, required: true },
  quantity: { type: Number, required: true },
});

ERC1155TokenSchema.index({ contract: 1, tokenId: 1, owner: 1 });

export const ERC721TokenModel = mongoose.model(
  'ERC721Token',
  ERC721TokenSchema,
);

export const ERC1155TokenModel = mongoose.model(
  'ERC1155Token',
  ERC1155TokenSchema,
);

const ERC721TokenTC = composeMongoose(ERC721TokenModel);
const ERC1155TokenTC = composeMongoose(ERC1155TokenModel);

schemaComposer.Query.addFields({
  nftLatestBlock: repository.lastIndexedBlock.query.latestBlock,
  erc721Tokens: ERC721TokenTC.mongooseResolvers.findMany(filter),
  erc1155Tokens: ERC1155TokenTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();

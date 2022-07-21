import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { filter, repository, Types } from 'indexer-utils';
import mongoose from 'mongoose';
import { MismatchedTransfers, MissingContracts } from './indexer/types';

// @ts-ignore
interface NFTSaleDocument extends Types.Nft.Sale, mongoose.Document {}
// @ts-ignore
interface MissingContractsDocument
  extends MissingContracts,
    mongoose.Document {}
// @ts-ignore
interface MismatchedTransfersDocument
  extends MismatchedTransfers,
    mongoose.Document {}

export const NFTSaleSchema = new mongoose.Schema<NFTSaleDocument>({
  _id: String,
  from: { type: String, required: true },
  to: { type: String, required: true },
  contract: { type: String, required: true },
  tokenId: { type: String, required: true },
  price: { type: String, required: true },
  erc20Contract: String,
  erc20Symbol: String,
  erc20Name: String,
  erc20Decimals: Number,
  quantity: Number,
  collectionName: String,
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
});

NFTSaleSchema.index({ from: 1 });
NFTSaleSchema.index({ to: 1 });
NFTSaleSchema.index({ contract: 1 });
NFTSaleSchema.index({ tokenId: 1 });
NFTSaleSchema.index({ transactionHash: 1 });
NFTSaleSchema.index({ blockNumber: 1 });

export const MissingContractsSchema =
  new mongoose.Schema<MissingContractsDocument>({
    _id: String,
  });

export const MismatchedTransfersSchema =
  new mongoose.Schema<MismatchedTransfersDocument>({
    _id: String,
  });

export const NFTSaleModel = mongoose.model('NFTSale', NFTSaleSchema);
export const MissingContractsModel = mongoose.model(
  'MissingContracts',
  MissingContractsSchema,
);
export const MismatchedTransfersModel = mongoose.model(
  'MismatchedTransfers',
  MismatchedTransfersSchema,
);

const NFTSaleTC = composeMongoose(NFTSaleModel);
const MissingContractsTC = composeMongoose(MissingContractsModel);
const MismatchedTransfersTC = composeMongoose(MismatchedTransfersModel);

schemaComposer.Query.addFields({
  nftPriceEthLatestBlock: repository.lastIndexedBlock.query.latestBlock,
  nftSales: NFTSaleTC.mongooseResolvers.findMany(filter),
  missingContracts: MissingContractsTC.mongooseResolvers.findMany(filter),
  mismatchedTransfers: MismatchedTransfersTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();

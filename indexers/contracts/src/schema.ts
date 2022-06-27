import mongoose from 'mongoose';
import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter, repository } from 'indexer-utils';

// @ts-ignore
interface ERC20Document
  extends Types.Contract.ERC20Contract,
    mongoose.Document {}
// @ts-ignore
interface ERC721Document
  extends Types.Contract.ERC721Contract,
    mongoose.Document {}
// @ts-ignore
interface ERC1155Document
  extends Types.Contract.ERC1155Contract,
    mongoose.Document {}
// @ts-ignore
interface UniswapV2Document
  extends Types.Contract.UniswapV2Contract,
    mongoose.Document {}
// @ts-ignore
interface UniswapV3Document
  extends Types.Contract.UniswapV3Contract,
    mongoose.Document {}

const sharedSchema = {
  _id: String,
  creator: { type: String, required: true, index: true },
  blockNumber: { type: Number, required: true, index: true },
  erc165: { type: Boolean, required: true, index: true },
  timestamp: { type: Number, required: true },
};

const ERC20ContractSchema = new mongoose.Schema<ERC20Document>({
  ...sharedSchema,
  symbol: String,
  name: String,
  decimals: Number,
});

const ERC721ContractSchema = new mongoose.Schema<ERC721Document>({
  ...sharedSchema,
  erc721TokenReceiver: { type: Boolean, required: true, index: true },
  erc721Metadata: { type: Boolean, required: true, index: true },
  erc721Enumerable: { type: Boolean, required: true, index: true },
  name: String,
});

const ERC1155ContractSchema = new mongoose.Schema<ERC1155Document>({
  ...sharedSchema,
  erc1155TokenReceiver: { type: Boolean, required: true, index: true },
  erc1155MetadataURI: { type: Boolean, required: true, index: true },
  name: String,
});

const UniswapV2ContractSchema = new mongoose.Schema<UniswapV2Document>(
  sharedSchema,
);

const UniswapV3ContractSchema = new mongoose.Schema<UniswapV3Document>(
  sharedSchema,
);

export const ERC20ContractModel = mongoose.model(
  'ERC20Contract',
  ERC20ContractSchema,
);

export const ERC721ContractModel = mongoose.model(
  'ERC721Contract',
  ERC721ContractSchema,
);

export const ERC1155ContractModel = mongoose.model(
  'ERC1155Contract',
  ERC1155ContractSchema,
);

export const UniswapV2ContractModel = mongoose.model(
  'UniswapV2Contract',
  UniswapV2ContractSchema,
);

export const UniswapV3ContractModel = mongoose.model(
  'UniswapV3Contract',
  UniswapV3ContractSchema,
);

const ERC20ContractTC = composeMongoose(ERC20ContractModel);
const ERC721ContractTC = composeMongoose(ERC721ContractModel);
const ERC1155ContractTC = composeMongoose(ERC1155ContractModel);
const UniswapV2ContractTC = composeMongoose(UniswapV2ContractModel);
const UniswapV3ContractTC = composeMongoose(UniswapV3ContractModel);

schemaComposer.Query.addFields({
  contractsLatestBlock: repository.lastIndexedBlock.query.latestBlock,
  erc20Contracts: ERC20ContractTC.mongooseResolvers.findMany(filter),
  erc721Contracts: ERC721ContractTC.mongooseResolvers.findMany(filter),
  erc1155Contracts: ERC1155ContractTC.mongooseResolvers.findMany(filter),
  uniswapV2Contracts: UniswapV2ContractTC.mongooseResolvers.findMany(filter),
  uniswapV3Contracts: UniswapV3ContractTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();

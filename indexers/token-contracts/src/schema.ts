import mongoose from 'mongoose';
import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter } from 'indexer-utils';

interface ERC20Document
  extends Types.Contract.ERC20Contract,
    mongoose.Document {}
interface ERC721Document
  extends Types.Contract.ERC721Contract,
    mongoose.Document {}
interface ERC1155Document
  extends Types.Contract.ERC1155Contract,
    mongoose.Document {}

// temp model to allow dependent indexers to track latest block
// todo update to more sophisticated schema that works with parallel instances
const BlockSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, index: true },
  },
  { capped: { size: 1024, max: 1, autoIndexId: true } }
);

const ERC20ContractSchema = new mongoose.Schema<ERC20Document>({
  address: { type: String, required: true, index: true },
  creator: { type: String, required: true, index: true },
  blockNumber: { type: Number, required: true, index: true },
  erc165: { type: Boolean, required: true, index: true },
  timestamp: { type: Number, required: true },
  symbol: String,
  name: String,
  decimals: Number,
});

const ERC721ContractSchema = new mongoose.Schema<ERC721Document>({
  address: { type: String, required: true, index: true },
  creator: { type: String, required: true, index: true },
  blockNumber: { type: Number, required: true, index: true },
  erc165: { type: Boolean, required: true, index: true },
  erc721TokenReceiver: { type: Boolean, required: true, index: true },
  erc721Metadata: { type: Boolean, required: true, index: true },
  erc721Enumerable: { type: Boolean, required: true, index: true },
  timestamp: { type: Number, required: true },
  name: String,
});

const ERC1155ContractSchema = new mongoose.Schema<ERC1155Document>({
  address: { type: String, required: true, index: true },
  creator: { type: String, required: true, index: true },
  blockNumber: { type: Number, required: true, index: true },
  erc165: { type: Boolean, required: true, index: true },
  erc1155TokenReceiver: { type: Boolean, required: true, index: true },
  erc1155MetadataURI: { type: Boolean, required: true, index: true },
  timestamp: { type: Number, required: true },
  name: String,
});

export const BlockModel = mongoose.model('Block', BlockSchema);

export const ERC20ContractModel = mongoose.model(
  'ERC20Contract',
  ERC20ContractSchema
);

export const ERC721ContractModel = mongoose.model(
  'ERC721Contract',
  ERC721ContractSchema
);

export const ERC1155ContractModel = mongoose.model(
  'ERC1155Contract',
  ERC1155ContractSchema
);

const BlockTC = composeMongoose(BlockModel);
const ERC20ContractTC = composeMongoose(ERC20ContractModel);
const ERC721ContractTC = composeMongoose(ERC721ContractModel);
const ERC1155ContractTC = composeMongoose(ERC1155ContractModel);

BlockTC.addResolver({
  kind: 'query',
  name: 'tokenContractsLatestBlock',
  type: 'Int',
  resolve: async () => {
    const results = await BlockModel.find({});
    return results[0]?.number || 0;
  },
});

schemaComposer.Query.addFields({
  tokenContractsLatestBlock: BlockTC.getResolver('tokenContractsLatestBlock'),
  erc20Contracts: ERC20ContractTC.mongooseResolvers.findMany(filter),
  erc721Contracts: ERC721ContractTC.mongooseResolvers.findMany(filter),
  erc1155Contracts: ERC1155ContractTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();

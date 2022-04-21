import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import mongoose from 'mongoose';
import { filter, Types } from 'indexer-utils';

interface DecodedContractEventDocument
  extends Types.Contract.DecodedContractEvent,
    mongoose.Document {}
interface DecodedContractTransactionDocument
  extends Types.Contract.DecodedContractTransaction,
    mongoose.Document {}

// temp model to allow dependent indexers to track latest block
// todo update to more sophisticated schema that works with parallel instances
const BlockSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, index: true },
  },
  { capped: { size: 1024, max: 1, autoIndexId: true } }
);

export const DecodedEventSchema =
  new mongoose.Schema<DecodedContractEventDocument>({
    blockNumber: { type: Number, required: true, index: true },
    contract: { type: String, required: true, index: true },
    transactionHash: { type: String, required: true, index: true },
    blockTimestamp: { type: Number, required: true },
    signature: { type: String, required: true, index: true },
    value1: String,
    value2: String,
    value3: String,
    value4: String,
    type1: String,
    type2: String,
    type3: String,
    type4: String,
  });

export const DecodedTransactionSchema =
  new mongoose.Schema<DecodedContractTransactionDocument>({
    hash: { type: String, required: true, index: true },
    blockNumber: { type: Number, required: true, index: true },
    contract: { type: String, required: true, index: true },
    signer: { type: String, required: true },
    blockTimestamp: { type: Number, required: true },
    signature: { type: String, required: true, index: true },
    value1: String,
    value2: String,
    value3: String,
    value4: String,
    value5: String,
    value6: String,
    type1: String,
    type2: String,
    type3: String,
    type4: String,
    type5: String,
    type6: String,
  });

export const BlockModel = mongoose.model('Block', BlockSchema);

export const ERC20EventDecodedModel = mongoose.model(
  'ERC20EventDecoded',
  DecodedEventSchema
);

export const ERC721EventDecodedModel = mongoose.model(
  'ERC721EventDecoded',
  DecodedEventSchema
);

export const ERC1155EventDecodedModel = mongoose.model(
  'ERC1155EventDecoded',
  DecodedEventSchema
);

export const ERC20TransactionDecodedModel = mongoose.model(
  'ERC20TransactionDecoded',
  DecodedTransactionSchema
);

export const ERC721TransactionDecodedModel = mongoose.model(
  'ERC721TransactionDecoded',
  DecodedTransactionSchema
);

export const ERC1155TransactionDecodedModel = mongoose.model(
  'ERC1155TransactionDecoded',
  DecodedTransactionSchema
);

const BlockTC = composeMongoose(BlockModel);
const ERC20EventDecodedTC = composeMongoose(ERC20EventDecodedModel);
const ERC721EventDecodedTC = composeMongoose(ERC721EventDecodedModel);
const ERC1155EventDecodedTC = composeMongoose(ERC1155EventDecodedModel);
const ERC20TransactionDecodedTC = composeMongoose(ERC20TransactionDecodedModel);
const ERC721TransactionDecodedTC = composeMongoose(
  ERC721TransactionDecodedModel
);
const ERC1155TransactionDecodedTC = composeMongoose(
  ERC1155TransactionDecodedModel
);

BlockTC.addResolver({
  kind: 'query',
  name: 'tokenActivityLatestBlock',
  type: 'Int',
  resolve: async () => {
    const results = await BlockModel.find({});
    return results[0]?.number || 0;
  },
});

schemaComposer.Query.addFields({
  tokenActivityLatestBlock: BlockTC.getResolver('tokenActivityLatestBlock'),
  erc20Events: ERC20EventDecodedTC.mongooseResolvers.findMany(filter),
  erc721Events: ERC721EventDecodedTC.mongooseResolvers.findMany(filter),
  erc1155Events: ERC1155EventDecodedTC.mongooseResolvers.findMany(filter),
  erc20Transactions:
    ERC20TransactionDecodedTC.mongooseResolvers.findMany(filter),
  erc721Transactions:
    ERC721TransactionDecodedTC.mongooseResolvers.findMany(filter),
  erc1155Transactions:
    ERC1155TransactionDecodedTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();

import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import mongoose from 'mongoose';
import { filter, repository, Types } from 'indexer-utils';

// @ts-ignore
interface DecodedContractEventDocument
  extends Types.Contract.DecodedContractEvent,
    mongoose.Document {}

export const DecodedEventSchema =
  new mongoose.Schema<DecodedContractEventDocument>({
    _id: String,
    blockNumber: { type: Number, required: true, index: true },
    contract: { type: String, required: true, index: true },
    transactionHash: { type: String, required: true, index: true },
    signature: { type: String, required: true, index: true },
    blockTimestamp: { type: Number, required: true },
    logIndex: { type: Number, required: true },
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

export const ERC20EventDecodedModel = mongoose.model(
  'ERC20EventDecoded',
  DecodedEventSchema,
);

export const ERC721EventDecodedModel = mongoose.model(
  'ERC721EventDecoded',
  DecodedEventSchema,
);

export const ERC1155EventDecodedModel = mongoose.model(
  'ERC1155EventDecoded',
  DecodedEventSchema,
);

const ERC20EventDecodedTC = composeMongoose(ERC20EventDecodedModel);
const ERC721EventDecodedTC = composeMongoose(ERC721EventDecodedModel);
const ERC1155EventDecodedTC = composeMongoose(ERC1155EventDecodedModel);

schemaComposer.Query.addFields({
  tokenActivityLatestBlock: repository.lastIndexedBlock.query.latestBlock,
  erc20Events: ERC20EventDecodedTC.mongooseResolvers.findMany(filter),
  erc721Events: ERC721EventDecodedTC.mongooseResolvers.findMany(filter),
  erc1155Events: ERC1155EventDecodedTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();

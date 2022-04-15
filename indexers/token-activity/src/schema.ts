import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import mongoose from 'mongoose';
import { filter, Types } from 'archive-utils';

export const DecodedTransactionSchema =
  new mongoose.Schema<Types.Contract.DecodedContractTransaction>({
    _id: String,
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

const ERC20TransactionDecodedTC = composeMongoose(ERC20TransactionDecodedModel);
const ERC721TransactionDecodedTC = composeMongoose(
  ERC721TransactionDecodedModel
);
const ERC1155TransactionDecodedTC = composeMongoose(
  ERC1155TransactionDecodedModel
);

schemaComposer.Query.addFields({
  erc20TransactionById:
    ERC20TransactionDecodedTC.mongooseResolvers.findById(filter),
  erc20Transactions:
    ERC20TransactionDecodedTC.mongooseResolvers.findMany(filter),
  erc721TransactionById:
    ERC721TransactionDecodedTC.mongooseResolvers.findById(filter),
  erc721Transactions:
    ERC721TransactionDecodedTC.mongooseResolvers.findMany(filter),
  erc1155TransactionById:
    ERC1155TransactionDecodedTC.mongooseResolvers.findById(filter),
  erc1155Transactions:
    ERC1155TransactionDecodedTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();

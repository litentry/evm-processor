import { composeMongoose } from 'graphql-compose-mongoose';
import getEnvVar from 'indexer-serverless/lib/util/get-env-var';
import { filter, Types } from 'indexer-utils';
import mongoose from 'mongoose';
import { LogModel, LogTC } from './log';

// @ts-ignore
interface NativeTokenTransactionDocument
  extends Types.Archive.NativeTokenTransaction,
    mongoose.Document {}
// @ts-ignore
interface ContractTransactionDocument
  extends Types.Archive.ContractTransaction,
    mongoose.Document {}
// @ts-ignore
interface ContractCreationTransactionDocument
  extends Types.Archive.ContractCreationTransaction,
    mongoose.Document {}

const sharedSchema = {
  _id: String,
  nonce: { type: Number, required: true },
  blockHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
  transactionIndex: { type: Number, required: true },
  from: { type: String, required: true },
  value: { type: String, required: true },
  gasPrice: { type: String, required: true },
  gas: { type: String, required: true },
  receiptStatus: Boolean,
  receiptGasUsed: { type: String, required: true },
  receiptCumulativeGasUsed: { type: String, required: true },
};

const sharedSchemaOptions: mongoose.SchemaOptions = {};
if (getEnvVar('SHARDING_ENABLED', false)) {
  sharedSchemaOptions.shardKey = { _id: 'hashed' };
}

// no input/method, no contract created, must have a receiver (to)
const nativeTokenTransactionSchema =
  new mongoose.Schema<NativeTokenTransactionDocument>(
    {
      ...sharedSchema,
      to: { type: String, required: true },
    },
    {
      ...sharedSchemaOptions,
    },
  );

// to is the contract, must have an input
const contractTransactionSchema =
  new mongoose.Schema<ContractTransactionDocument>(
    {
      ...sharedSchema,
      to: { type: String, required: true },
      methodId: { type: String, required: true },
      input: { type: String, required: true },
    },
    {
      ...sharedSchemaOptions,
    },
  );

// no to address, input is contract creation code, must have contract address in receipt
const contractCreationTransactionSchema =
  new mongoose.Schema<ContractCreationTransactionDocument>(
    {
      ...sharedSchema,
      methodId: { type: String, required: true },
      input: { type: String, required: true },
      receiptContractAddress: { type: String, required: true },
    },
    {
      ...sharedSchemaOptions,
    },
  );

// INDEXES
nativeTokenTransactionSchema.index({ blockNumber: 1 });
nativeTokenTransactionSchema.index({ to: 1 });
nativeTokenTransactionSchema.index({ from: 1 });
contractTransactionSchema.index({ blockNumber: 1 });
contractTransactionSchema.index({ to: 1 });
contractTransactionSchema.index({ methodId: 1 });
contractCreationTransactionSchema.index({ blockNumber: 1 });
contractCreationTransactionSchema.index({ receiptContractAddress: 1 });

// MODELS
export const NativeTokenTransactionModel = mongoose.model(
  'NativeTokenTransaction',
  nativeTokenTransactionSchema,
);
export const ContractTransactionModel = mongoose.model(
  'ContractTransaction',
  contractTransactionSchema,
);
export const ContractCreationTransactionModel = mongoose.model(
  'ContractCreationTransaction',
  contractCreationTransactionSchema,
);

// GRAPH
const NativeTokenTransactionTC = composeMongoose(NativeTokenTransactionModel);
const ContractTransactionTC = composeMongoose(ContractTransactionModel);
const ContractCreationTransactionTC = composeMongoose(
  ContractCreationTransactionModel,
);

ContractTransactionTC.addFields({
  logs: {
    type: [LogTC],
    resolve: async (transaction) => {
      if (!transaction.blockNumber || !transaction.transactionIndex) {
        throw Error(
          'transaction.blockNumber & transaction.transactionIndex are required to query logs',
        );
      }

      return LogModel.find({
        transactionId: `0x${transaction.blockNumber.toString(
          16,
        )}.0x${transaction.transactionIndex.toString(16)}`,
      });
    },
  },
});

export const transactionQuery = {
  nativeTokenTransactions:
    NativeTokenTransactionTC.mongooseResolvers.findMany(filter),
  contractTransactions:
    ContractTransactionTC.mongooseResolvers.findMany(filter),
  contractCreationTransactions:
    ContractCreationTransactionTC.mongooseResolvers.findMany(filter),
};

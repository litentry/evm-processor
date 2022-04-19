import { Schema, model } from 'mongoose';
import type { Types } from 'indexer-utils';

const sharedSchema = {
  hash: { type: String, required: true, unique: true },
  nonce: { type: Number, required: true },
  blockHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
  transactionIndex: { type: Number, required: true },
  from: { type: String, required: true },
  value: { type: String, required: true },
  gasPrice: { type: String, required: true },
  gas: { type: Number, required: true },
  receiptStatus: Boolean,
  receiptGasUsed: { type: Number, required: true },
  receiptCumulativeGasUsed: { type: Number, required: true },
};

// no input/method, no contract created, must have a receiver (to)
const nativeTokenTransactionSchema =
  new Schema<Types.Archive.NativeTokenTransaction>({
    ...sharedSchema,
    to: { type: String, required: true },
  });
nativeTokenTransactionSchema.index({ blockNumber: 1 });
nativeTokenTransactionSchema.index({ to: 1 });
nativeTokenTransactionSchema.index({ from: 1 });
nativeTokenTransactionSchema.index({ value: 1 });
export const NativeTokenTransactionModel =
  model<Types.Archive.NativeTokenTransaction>(
    'NativeTokenTransaction',
    nativeTokenTransactionSchema
  );

// to is the contract, must have an input
const contractTransactionSchema = new Schema<Types.Archive.ContractTransaction>(
  {
    ...sharedSchema,
    to: { type: String, required: true },
    methodId: { type: String, required: true },
    input: { type: String, required: true },
  }
);
contractTransactionSchema.index({ blockNumber: 1 });
contractTransactionSchema.index({ to: 1 });
contractTransactionSchema.index({ methodId: 1 });
export const ContractTransactionModel =
  model<Types.Archive.ContractTransaction>(
    'ContractTransaction',
    contractTransactionSchema
  );

// no to address, input is contract creation code, must have contract address in receipt
const contractCreationTransactionSchema =
  new Schema<Types.Archive.ContractCreationTransaction>({
    ...sharedSchema,
    methodId: { type: String, required: true },
    input: { type: String, required: true },
    receiptContractAddress: { type: String, required: true },
  });
contractCreationTransactionSchema.index({ blockNumber: 1 });
contractCreationTransactionSchema.index({ receiptContractAddress: 1 });
export const ContractCreationTransactionModel =
  model<Types.Archive.ContractCreationTransaction>(
    'ContractCreationTransaction',
    contractCreationTransactionSchema
  );

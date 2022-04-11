import { Schema, model } from 'mongoose';
import type {
  NativeTokenTransaction,
  ContractCreationTransaction,
  ContractTransaction,
} from '../types';

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
const nativeTokenTransactionSchema = new Schema<NativeTokenTransaction>({
  ...sharedSchema,
  to: { type: String, required: true },
});
nativeTokenTransactionSchema.index({ blockNumber: 1 });
nativeTokenTransactionSchema.index({ to: 1 });
nativeTokenTransactionSchema.index({ from: 1 });
nativeTokenTransactionSchema.index({ value: 1 });
export const NativeTokenTransactionModel = model<NativeTokenTransaction>(
  'NativeTokenTransaction',
  nativeTokenTransactionSchema
);

// to is the contract, must have an input
const contractTransactionSchema = new Schema<ContractTransaction>({
  ...sharedSchema,
  to: { type: String, required: true },
  methodId: { type: String, required: true },
  input: { type: String, required: true },
});
contractTransactionSchema.index({ blockNumber: 1 });
contractTransactionSchema.index({ to: 1 });
contractTransactionSchema.index({ methodId: 1 });
export const ContractTransactionModel = model<ContractTransaction>(
  'ContractTransaction',
  contractTransactionSchema
);

// no to address, input is contract creation code, must have contract address in receipt
const contractCreationTransactionSchema =
  new Schema<ContractCreationTransaction>({
    ...sharedSchema,
    methodId: { type: String, required: true },
    input: { type: String, required: true },
    receiptContractAddress: { type: String, required: true },
  });
contractCreationTransactionSchema.index({ blockNumber: 1 });
contractCreationTransactionSchema.index({ receiptContractAddress: 1 });
export const ContractCreationTransactionModel =
  model<ContractCreationTransaction>(
    'ContractCreationTransaction',
    contractCreationTransactionSchema
  );

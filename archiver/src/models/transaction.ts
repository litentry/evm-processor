import { Schema, model } from 'mongoose';
import type { Transaction } from '../types';

const transactionSchema = new Schema<Transaction>({
  hash: { type: String, required: true, unique: true },
  nonce: { type: Number, required: true },
  blockHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
  transactionIndex: { type: Number, required: true },
  from: { type: String, required: true },
  to: String,
  value: { type: String, required: true },
  gasPrice: { type: String, required: true },
  gas: { type: Number, required: true },
  maxPriorityFeePerGas: String,
  maxFeePerGas: String,
  input: { type: String, required: true },
  methodId: String,
  receiptStatus: Boolean,
  receiptGasUsed: { type: Number, required: true },
  receiptEffectiveGasPrice: { type: Number, required: true },
  receiptCumulativeGasUsed: { type: Number, required: true },
  receiptContractAddress: String,
});

transactionSchema.index({ blockNumber: 1 });
transactionSchema.index({ methodId: 1 });
transactionSchema.index({ to: 1 });

const TransactionModel = model<Transaction>('Transaction', transactionSchema);

export default TransactionModel;

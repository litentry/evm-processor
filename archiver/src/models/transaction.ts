import { Schema, model } from 'mongoose';
import type { Transaction } from '../types';

const transactionSchema = new Schema<Transaction>({
  blockNumber: { type: Number, required: true },
  transactionIndex: { type: Number, required: true },
  nonce: { type: Number, required: true },
  blockHash: { type: String, required: true },
  data: { type: String, required: true },
  hash: { type: String, required: true },
  from: { type: String, required: true },
  // bignumbers
  value: { type: String, required: true },
  gasUsed: { type: String, required: true },
  cumulativeGasUsed: { type: String, required: true },
  effectiveGasPrice: { type: String, required: true },
  methodId: String,
  to: String,
  contractCreated: String,
  accessList: String,
  type: Number,
});

transactionSchema.index({ blockNumber: 1 });
transactionSchema.index({ methodId: 1 });
transactionSchema.index({ to: 1 });

const TransactionModel = model<Transaction>('Transaction', transactionSchema);

export default TransactionModel;

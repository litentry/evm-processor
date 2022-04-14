import { ERC20Transaction } from 'archive-utils';
import mongoose from 'mongoose';

const ERC20TransactionSchema = new mongoose.Schema<ERC20Transaction>({
  _id: String,
  contract: { type: String, required: true, index: true },
  method: { type: String, required: true, index: true },
  blockNumber: { type: Number, required: true, index: true },
  signer: { type: String, required: true },
  methodId: { type: String, required: true },
  value: { type: String, required: true },
  input: { type: String, required: true },
  inputDecoded: { type: String, required: true },
  blockTimestamp: { type: Number, required: true },
});

const ERC20TransactionModel = mongoose.model(
  'ERC20Transaction',
  ERC20TransactionSchema
);

export default ERC20TransactionModel;

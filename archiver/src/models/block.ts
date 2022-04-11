import type { Block } from 'archive-utils';
import { Schema, model } from 'mongoose';

const blockSchema = new Schema<Block>({
  number: { type: Number, required: true, unique: true },
  hash: { type: String, required: true, unique: true },
  parentHash: { type: String, required: true },
  nonce: String,
  sha3Uncles: { type: String, required: true },
  transactionRoot: String,
  stateRoot: { type: String, required: true },
  miner: { type: String, required: true },
  extraData: { type: String, required: true },
  gasLimit: { type: Number, required: true },
  gasUsed: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  size: { type: Number, required: true },
  difficulty: { type: String, required: true },
  totalDifficulty: { type: String, required: true },
  uncles: String,
});

blockSchema.index({ number: 1 });

const BlockModel = model<Block>('Block', blockSchema);

export default BlockModel;

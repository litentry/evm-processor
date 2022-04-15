import { Schema, model } from 'mongoose';
import type { Types } from 'archive-utils';

const logSchema = new Schema<Types.Archive.Log>({
  blockNumber: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
  transactionHash: { type: String, required: true },
  address: { type: String, required: true },
  topic0: { type: String, required: true },
  topic1: String,
  topic2: String,
  topic3: String,
  topic4: String,
  data: { type: String, required: true },
  logIndex: { type: Number, required: true },
});

logSchema.index({ blockNumber: 1 });
logSchema.index({ transactionHash: 1 });
logSchema.index({ address: 1 });
logSchema.index({ topic0: 1 });

const LogModel = model<Types.Archive.Log>('Log', logSchema);

export default LogModel;

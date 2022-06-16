import mongoose from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter } from 'indexer-utils';

interface LogDocument extends Types.Archive.Log, mongoose.Document {}

const LogSchema = new mongoose.Schema<LogDocument>({
  blockNumber: { type: Number, required: true, index: true },
  transactionHash: { type: String, required: true },
  address: { type: String, required: true },
  topic0: { type: String, required: true },
  topic1: String,
  topic2: String,
  topic3: String,
  topic4: String,
  data: { type: String, required: true },
  logIndex: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
});

export const LogModel = mongoose.model('Log', LogSchema);

export const LogTC = composeMongoose(LogModel);

export const logQuery = {
  logs: LogTC.mongooseResolvers.findMany(filter),
};

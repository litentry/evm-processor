import mongoose from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter } from 'indexer-utils';
import getEnvVar from 'indexer-serverless/lib/util/get-env-var';

const schemaOptions: mongoose.SchemaOptions = {};
if (getEnvVar('SHARDING_ENABLED', false)) {
  schemaOptions.shardKey = { hash: 'hashed' };
}

// @ts-ignore
interface LogDocument extends Types.Archive.Log, mongoose.Document {}

const LogSchema = new mongoose.Schema<LogDocument>(
  {
    _id: String,
    transactionId: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    address: { type: String, required: true },
    topic0: { type: String, required: true },
    topic1: String,
    topic2: String,
    topic3: String,
    topic4: String,
    data: { type: String, required: true },
    logIndex: { type: Number, required: true },
    transactionHash: { type: String, required: true },
    blockTimestamp: { type: Number, required: true },
  },
  {
    ...schemaOptions,
  },
);

LogSchema.index({ blockNumber: 1 });
LogSchema.index({ transactionId: 1 });
LogSchema.index({ address: 1 });
LogSchema.index({ topic0: 1 });

export const LogModel = mongoose.model('Log', LogSchema);

export const LogTC = composeMongoose(LogModel);

export const logQuery = {
  logs: LogTC.mongooseResolvers.findMany(filter),
};

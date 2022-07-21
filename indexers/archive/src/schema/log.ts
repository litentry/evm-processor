import { composeMongoose } from 'graphql-compose-mongoose';
import getEnvVar from 'indexer-serverless/lib/util/get-env-var';
import { filter, Types } from 'indexer-utils';
import mongoose from 'mongoose';

const schemaOptions: mongoose.SchemaOptions = {};
if (getEnvVar('SHARDING_ENABLED', false)) {
  schemaOptions.shardKey = { _id: 'hashed' };
}

// @ts-ignore
interface LogDocument extends Types.Archive.Log, mongoose.Document {}

const LogSchema = new mongoose.Schema<LogDocument>(
  {
    _id: String,
    transactionHash: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    address: { type: String, required: true },
    topic0: { type: String, required: true },
    topic1: String,
    topic2: String,
    topic3: String,
    topic4: String,
    data: { type: String, required: true },
    logIndex: { type: Number, required: true },
    blockTimestamp: { type: Number, required: true },
  },
  {
    ...schemaOptions,
  },
);

LogSchema.index({ blockNumber: 1 });
LogSchema.index({ transactionHash: 1 });
LogSchema.index({ address: 1 });
LogSchema.index({ topic0: 1 });
LogSchema.index({ topic3: 1 }); // https://github.com/litentry/evm-processor/issues/133

export const LogModel = mongoose.model('Log', LogSchema);

export const LogTC = composeMongoose(LogModel);

export const logQuery = {
  logs: LogTC.mongooseResolvers.findMany(filter),
};

import mongoose from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter } from 'indexer-utils';
import getEnvVar from 'indexer-serverless/lib/util/get-env-var';

const schemaOptions: mongoose.SchemaOptions = {};
if (getEnvVar('SHARDING_ENABLED', false)) {
  schemaOptions.shardKey = { hash: 'hashed' };
}

interface LogDocument extends Types.Archive.Log, mongoose.Document {}

const LogSchema = new mongoose.Schema<LogDocument>(
  {
    blockNumber: { type: Number, required: true, index: true },
    transactionHash: { type: String, required: true, index: true },
    address: { type: String, required: true, index: true },
    topic0: { type: String, required: true, index: true },
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

export const LogModel = mongoose.model('Log', LogSchema);

export const LogTC = composeMongoose(LogModel);

export const logQuery = {
  logs: LogTC.mongooseResolvers.findMany(filter),
};

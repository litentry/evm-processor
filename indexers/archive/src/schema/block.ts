import mongoose from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter } from 'indexer-utils';
import getEnvVar from 'indexer-serverless/lib/util/get-env-var';

// @ts-ignore
interface BlockDocument extends Types.Archive.Block, mongoose.Document {}

const schemaOptions: mongoose.SchemaOptions = {};
if (getEnvVar('SHARDING_ENABLED', false)) {
  schemaOptions.shardKey = { _id: 'hashed' };
}

const BlockSchema = new mongoose.Schema<BlockDocument>(
  {
    _id: Number,
    hash: { type: String, required: true },
    parentHash: { type: String, required: true },
    nonce: String,
    sha3Uncles: { type: String, required: true },
    transactionRoot: String,
    stateRoot: { type: String, required: true },
    miner: { type: String, required: true },
    extraData: { type: String, required: true },
    gasLimit: { type: String, required: true },
    gasUsed: { type: String, required: true },
    timestamp: { type: Number, required: true },
    size: { type: Number, required: true },
    difficulty: { type: String, required: true },
    totalDifficulty: { type: String, required: true },
    uncles: String,
  },
  {
    ...schemaOptions,
  },
);

export const BlockModel = mongoose.model('Block', BlockSchema);

const BlockTC = composeMongoose(BlockModel);

export const blockQuery = {
  blocks: BlockTC.mongooseResolvers.findMany(filter),
};

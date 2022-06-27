import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import mongoose from 'mongoose';
import { filter, repository } from 'indexer-utils';
import { Swap } from './indexer/types';

// @ts-ignore
interface SwapDocument extends Swap, mongoose.Document {}

export const SwapSchema = new mongoose.Schema<SwapDocument>({
  _id: String,
  address: { type: String, required: true, index: true },
  contract: { type: String, required: true, index: true },
  pair: { type: String, required: true, index: true },
  intermediatePath: { type: String },
  deadline: { type: String, required: true },
  token0: { type: String, required: true },
  token1: { type: String, required: true },
  token0Amount: { type: String, required: true },
  token1Amount: { type: String, required: true },
  method: { type: String, required: true },
  gas: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

export const SwapModel = mongoose.model('Swap', SwapSchema);

const SwapTC = composeMongoose(SwapModel);

schemaComposer.Query.addFields({
  uniswapLatestBlock: repository.lastIndexedBlock.query.latestBlock,
  swaps: SwapTC.mongooseResolvers.findMany(filter),
});

export default schemaComposer.buildSchema();

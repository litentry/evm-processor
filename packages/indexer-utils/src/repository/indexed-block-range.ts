import mongoose from 'mongoose';

export interface IndexedBlockRangeDocument extends mongoose.Document {
  startBlock: number;
  endBlock: number;
}

const IndexedBlockRangeSchema = new mongoose.Schema<IndexedBlockRangeDocument>({
  startBlock: { type: Number, required: true },
  endBlock: { type: Number, required: true },
});

export const Model = mongoose.model(
  'IndexedBlockRange',
  IndexedBlockRangeSchema,
);

export const save = (startBlock: number, endBlock: number) =>
  Model.create({ startBlock, endBlock });

export const get = (limit: number): Promise<IndexedBlockRangeDocument[]> =>
  Model.find({}).sort('startBlock').limit(limit).exec();

export const remove = (indexedBlockRanges: IndexedBlockRangeDocument[]) =>
  Model.deleteMany({
    _id: {
      $in: indexedBlockRanges.map((indexedBlockRange) => indexedBlockRange._id),
    },
  });

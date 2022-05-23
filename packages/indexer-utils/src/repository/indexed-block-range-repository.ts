import mongoose from 'mongoose';

export interface IndexedBlockRangeDocument extends mongoose.Document {
  startBlock: number;
  endBlock: number;
}

const IndexedBlockRangeSchema = new mongoose.Schema<IndexedBlockRangeDocument>({
  startBlock: { type: Number, required: true },
  endBlock: { type: Number, required: true },
});

export const IndexedBlockRangeModel = mongoose.model(
  'IndexedBlockRange',
  IndexedBlockRangeSchema
);

export const saveIndexedBlockRange = (startBlock: number, endBlock: number) =>
  IndexedBlockRangeModel.create({ startBlock, endBlock });

export const getIndexedBlockRanges = (): Promise<IndexedBlockRangeDocument[]> =>
  IndexedBlockRangeModel.find({}).sort('startBlock').exec();

export const deleteIndexedBlockRanges = (
  indexedBlockRanges: IndexedBlockRangeDocument[]
) =>
  Promise.all(
    indexedBlockRanges.map((indexedBlockRange) => indexedBlockRange.delete())
  );

import mongoose from 'mongoose';
import {
  remove as removeIndexedBlockRanges,
  get as getIndexedBlockRanges,
  IndexedBlockRangeDocument,
} from './indexed-block-range';

interface LastIndexedBlockDocument extends mongoose.Document {
  lastIndexedBlock: number;
}

const LastIndexedBlockSchema = new mongoose.Schema<LastIndexedBlockDocument>({
  lastIndexedBlock: { type: Number, required: true },
});

export const Model = mongoose.model('LastIndexedBlock', LastIndexedBlockSchema);

export const get = async (): Promise<number | null> => {
  const currentValue = await Model.findOne({}).exec();
  if (!currentValue) {
    return null;
  }
  return currentValue.get('lastIndexedBlock') as number;
};

export const save = async (lastIndexedBlock: number): Promise<void> => {
  const currentValue = await Model.findOne().exec();

  if (!currentValue) {
    await Model.create({ lastIndexedBlock });
    return;
  }

  await currentValue.updateOne({ lastIndexedBlock });
};

export const calculate = async () => {
  let lastIndexedBlock = await get();
  const processedIndexedBlockRanges: IndexedBlockRangeDocument[] = [];
  const pendingIndexedBlockRanges = await getIndexedBlockRanges();

  pendingIndexedBlockRanges.forEach((pendingIndexedBlockRange) => {
    if ((lastIndexedBlock || 0) + 1 < pendingIndexedBlockRange.startBlock) {
      return;
    }

    processedIndexedBlockRanges.push(pendingIndexedBlockRange);

    lastIndexedBlock = pendingIndexedBlockRange.endBlock;
  });

  if (processedIndexedBlockRanges.length > 0 && lastIndexedBlock !== null) {
    await save(lastIndexedBlock);
    await removeIndexedBlockRanges(processedIndexedBlockRanges);
  }
};

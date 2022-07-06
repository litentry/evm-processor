import { composeMongoose } from 'graphql-compose-mongoose';
import mongoose from 'mongoose';
import {
  get as getIndexedBlockRanges,
  IndexedBlockRangeDocument,
  remove as removeIndexedBlockRanges,
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

export const calculateAndUpdate = async (): Promise<number> => {
  let lastIndexedBlock = await get();
  const processedIndexedBlockRanges: IndexedBlockRangeDocument[] = [];
  const pendingIndexedBlockRanges = await getIndexedBlockRanges(500);

  pendingIndexedBlockRanges.forEach((pendingIndexedBlockRange) => {
    if ((lastIndexedBlock || 0) + 1 < pendingIndexedBlockRange.startBlock) {
      return;
    }

    processedIndexedBlockRanges.push(pendingIndexedBlockRange);

    lastIndexedBlock = Math.max(
      pendingIndexedBlockRange.endBlock,
      lastIndexedBlock || 0,
    );
  });

  if (processedIndexedBlockRanges.length > 0 && lastIndexedBlock !== null) {
    await save(lastIndexedBlock);
    console.log(`Updated last indexed block to ${lastIndexedBlock}`);
    await removeIndexedBlockRanges(processedIndexedBlockRanges);
  }

  return lastIndexedBlock ?? -1;
};

const LastIndexedBlockTC = composeMongoose(Model);

LastIndexedBlockTC.addResolver({
  kind: 'query',
  name: 'latestBlock',
  type: 'Int',
  resolve: get,
});

export const query = {
  latestBlock: LastIndexedBlockTC.getResolver('latestBlock'),
};

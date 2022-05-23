import mongoose from 'mongoose';

interface LastIndexedBlockDocument extends mongoose.Document {
  lastIndexedBlock: number;
}

const LastIndexedBlockSchema = new mongoose.Schema<LastIndexedBlockDocument>({
  lastIndexedBlock: { type: Number, required: true },
});

export const LastIndexedBlockModel = mongoose.model(
  'LastIndexedBlock',
  LastIndexedBlockSchema
);

export const getLastIndexedBlock = async (): Promise<number | null> => {
  const currentValue = await LastIndexedBlockModel.findOne().exec();
  if (!currentValue) {
    return null;
  }
  return currentValue.get('lastIndexedBlock') as number;
};

export const saveLastIndexedBlock = async (
  lastIndexedBlock: number
): Promise<void> => {
  const currentValue = await LastIndexedBlockModel.findOne().exec();

  if (!currentValue) {
    await LastIndexedBlockModel.create({ lastIndexedBlock });
    return;
  }

  await currentValue.updateOne({ lastIndexedBlock });
};

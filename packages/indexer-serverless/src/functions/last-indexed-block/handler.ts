import mongoose from 'mongoose';
import { repository } from 'indexer-utils';

export default async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  await repository.lastIndexedBlock.calculate();
  await mongoose.disconnect();
};

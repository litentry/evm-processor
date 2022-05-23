import mongoose from 'mongoose';
// import { calculateLastIndexedBlock } from 'indexer-utils/lib/last-indexed-block';

export default async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  // await calculateLastIndexedBlock();
  await mongoose.disconnect();
};

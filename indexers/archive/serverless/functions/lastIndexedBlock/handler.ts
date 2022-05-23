import config from '@app/config';
import mongoose from 'mongoose';
import { calculateLastIndexedBlock } from 'indexer-utils/lib/last-indexed-block';

export default async () => {
  await mongoose.connect(config.mongoUri);
  await calculateLastIndexedBlock();
  await mongoose.disconnect();
};

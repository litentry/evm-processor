import mongoose from 'mongoose';
import { repository, utils } from 'indexer-utils';

export default async function lastIndexedBlock() {
  await mongoose.connect(process.env.MONGO_URI!);
  await utils.callXTimesOverYSeconds(5, 50, () =>
    repository.lastIndexedBlock.calculate(),
  );
  await mongoose.disconnect();
}

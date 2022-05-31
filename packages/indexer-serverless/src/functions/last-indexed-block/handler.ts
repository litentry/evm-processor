import { metrics, monitoring } from 'indexer-monitoring';
import { repository, utils } from 'indexer-utils';
import mongoose from 'mongoose';

export default async function lastIndexedBlock() {
  await mongoose.connect(process.env.MONGO_URI!);
  await utils.callXTimesOverYSeconds(5, 50, async () => {
    const lastIndexedBlock =
      await repository.lastIndexedBlock.calculateAndUpdate();
    monitoring.gauge(lastIndexedBlock, metrics.lastIndexedBlock);
  });
  await monitoring.pushMetrics();
  await mongoose.disconnect();
}

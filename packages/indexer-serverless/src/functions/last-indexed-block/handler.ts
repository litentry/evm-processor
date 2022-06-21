import { metrics, monitoring } from 'indexer-monitoring';
import { repository, utils } from 'indexer-utils';
import mongoose from 'mongoose';

export default async function lastIndexedBlock() {
  await mongoose.connect(process.env.MONGO_URI!);
  await utils.ensureShardedCollections(repository.lastIndexedBlock.Model);
  await utils.callXTimesOverYSeconds(3, 25, async () => {
    try {
      monitoring.markStart(metrics.lambdaLastIndexedSuccess);

      const lastIndexedBlock =
        await repository.lastIndexedBlock.calculateAndUpdate();

      monitoring.gauge(lastIndexedBlock, metrics.lastIndexedBlock);
      monitoring.markEndAndMeasure(metrics.lambdaLastIndexedSuccess);

      await monitoring.pushMetrics();
    } catch (error) {
      monitoring.incCounter(1, metrics.lambdaLastIndexedFailure);
      await monitoring.pushMetrics();

      throw error;
    }
  });
  await mongoose.disconnect();
}

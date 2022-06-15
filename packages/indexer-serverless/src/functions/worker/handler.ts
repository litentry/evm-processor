import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { awsUtils } from 'aws-utils';
import { metrics, monitoring } from 'indexer-monitoring';
import mongoose from 'mongoose';

export default async function worker(
  event: SQSEvent,
  handler: (start: number, end: number) => Promise<void>,
): Promise<SQSBatchResponse> {
  try {
    monitoring.markStart(metrics.lambdaWorkerSuccess);

    await mongoose.connect(process.env.MONGO_URI!);

    let failedMessages: SQSBatchItemFailure[] = [];

    failedMessages = await awsUtils.lambdaHandler(event, handler);

    monitoring.incCounter(
      event.Records.length,
      metrics.lambdaWorkerSuccessfulBatches,
    );
    monitoring.incCounter(
      failedMessages.length,
      metrics.lambdaWorkerFailedBatches,
    );

    return {
      batchItemFailures: failedMessages,
    };
  } catch (error) {
    console.log(monitoring);
    throw error;
  } finally {
    monitoring.markEnd(metrics.lambdaWorkerSuccess);

    monitoring.measure(metrics.lambdaWorkerSuccess);

    await monitoring.pushMetrics();

    await mongoose.disconnect();
  }
}

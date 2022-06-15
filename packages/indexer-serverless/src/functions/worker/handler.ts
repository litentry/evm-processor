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

    const failedMessages: SQSBatchItemFailure[] = await awsUtils.lambdaHandler(
      event,
      handler,
    );

    const failedMessagesCount = failedMessages.length;
    const successfulMessagesCount = event.Records.length - failedMessagesCount;

    if (successfulMessagesCount) {
      monitoring.incCounter(
        successfulMessagesCount,
        metrics.lambdaWorkerSuccessfulBatches,
      );
    }
    if (failedMessagesCount) {
      monitoring.incCounter(
        failedMessagesCount,
        metrics.lambdaWorkerFailedBatches,
      );
    }

    return {
      batchItemFailures: failedMessages,
    };
  } catch (error) {
    monitoring.incCounter(1, metrics.lambdaWorkerFailure);
    throw error;
  } finally {
    monitoring.markEndAndMeasure(metrics.lambdaWorkerSuccess);

    await monitoring.pushMetrics();

    await mongoose.disconnect();
  }
}

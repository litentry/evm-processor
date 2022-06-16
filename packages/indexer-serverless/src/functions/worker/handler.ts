import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { awsUtils } from 'aws-utils';
import { metrics, monitoring } from 'indexer-monitoring';
import { isNumber } from 'lodash';
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

    trackSqsCountMetrics(failedMessages, event);

    monitoring.markEndAndMeasure(metrics.lambdaWorkerSuccess);

    return {
      batchItemFailures: failedMessages,
    };
  } catch (error) {
    monitoring.incCounter(1, metrics.lambdaWorkerFailure);
    throw error;
  } finally {
    await monitoring.pushMetrics();

    await mongoose.disconnect();
  }
}

function trackSqsCountMetrics(
  failedMessages: SQSBatchItemFailure[],
  event: SQSEvent,
) {
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

  event.Records.forEach((r) => {
    if (
      r.attributes.ApproximateReceiveCount &&
      isNumber(r.attributes.ApproximateReceiveCount)
    ) {
      monitoring.observe(
        parseInt(r.attributes.ApproximateReceiveCount),
        metrics.sqsMessageReceiveCount,
      );
    }
  });
}

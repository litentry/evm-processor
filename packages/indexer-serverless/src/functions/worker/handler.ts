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

    await mongoose.connect(process.env.MONGO_URI!, {
      minPoolSize: 0,
      maxPoolSize: 10,
    });

    const failedMessages: SQSBatchItemFailure[] = await awsUtils.lambdaHandler(
      event,
      handler,
    );

    trackMetrics(failedMessages, event);

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

function trackMetrics(failedMessages: SQSBatchItemFailure[], event: SQSEvent) {
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

  const failedMessagesCount = failedMessages.length;
  const successfulMessagesCount = event.Records.length - failedMessagesCount;

  if (failedMessagesCount == 0) {
    monitoring.incCounter(
      successfulMessagesCount,
      metrics.lambdaWorkerSuccessfulBatches,
    );

    monitoring.markEndAndMeasure(metrics.lambdaWorkerSuccess);
    return;
  }

  monitoring.incCounter(failedMessagesCount, metrics.lambdaWorkerFailedBatches);
  monitoring.incCounter(1, metrics.lambdaWorkerFailure);
}

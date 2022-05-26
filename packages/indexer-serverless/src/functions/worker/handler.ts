import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { awsUtils } from 'aws-utils';
import mongoose from 'mongoose';
import { pushMetrics } from 'monitoring';

export default async function worker(
  event: SQSEvent,
  handler: (start: number, end: number) => Promise<void>,
): Promise<SQSBatchResponse> {
  console.log('Connecting to mongo');
  await mongoose.connect(process.env.MONGO_URI!);

  let response: SQSBatchItemFailure[] = [];

  try {
    response = await awsUtils.lambdaHandler(event, handler);
  } catch (e) {
    console.error('Outer handler error', e);
    throw e;
  }

  await pushMetrics();

  console.log('Disconnecting from mongo');
  await mongoose.disconnect();

  return {
    batchItemFailures: response,
  };
}

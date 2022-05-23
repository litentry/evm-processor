import { pushMetrics } from 'monitoring';
import mongoose from 'mongoose';
import { awsUtils } from 'aws-utils';
import { SQSEvent } from 'aws-lambda';
import { Config } from 'aws-utils/lib/utils/sqs';

export default async function worker(
  event: SQSEvent,
  handler: (start: number, end: number) => Promise<void>
) {
  console.log('Connecting to mongo');
  await mongoose.connect(process.env.MONGO_URI!);

  try {
    await awsUtils.lambdaHandler(
      event,
      JSON.parse(process.env.QUEUE_URL!) as Config,
      handler
    );

    await pushMetrics();
    console.log('Finish Push Metrics');
  } catch (e) {
    console.error('Outer handler error', e);
  }
  console.log('Disconnecting from mongo');

  await mongoose.disconnect();
}

import config from '@app/config';
import handler from '@app/handler';
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { awsUtils } from 'aws-utils';
import { pushMetrics } from 'monitoring';

const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
  await awsUtils.lambdaHandler(event, config.sqsConfig, handler);

  await pushMetrics();
  console.log('Finish Push Metrics');
}

export default lambdaHandler;
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { awsUtils } from 'aws-utils';
import { sqsConfig } from '../config';
import handler from '../handler';

export const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
  await awsUtils.lambdaHandler(event, sqsConfig, handler);
};

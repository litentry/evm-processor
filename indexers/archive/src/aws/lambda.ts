import { SQSEvent, SQSHandler } from 'aws-lambda';
import { awsUtils } from 'aws-utils';
import config from '../config';
import handler from '../handler';

export const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
  awsUtils.lambdaHandler(event, config.sqsConfig, handler);
}
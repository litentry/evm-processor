import config from '@app/config';
import handler from '@app/handler';
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { awsUtils } from 'aws-utils';

const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
  awsUtils.lambdaHandler(event, config.sqsConfig, handler);
}

export default lambdaHandler;
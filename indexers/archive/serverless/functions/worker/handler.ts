import config from '@app/config';
import handler from '@app/handler';
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { awsUtils } from 'aws-utils';
import { pushMetrics } from 'monitoring';
import mongoose from "mongoose";

const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
    console.log('Connecting to mongo');
    await mongoose.connect(config.mongoUri);
    try {
        await awsUtils.lambdaHandler(event, config.sqsConfig, handler);
        await pushMetrics();
        console.log('Finish Push Metrics');
    } catch (e) {
        console.error('Outer handler error', e);
    }
    console.log('Disconnecting from mongo');
    await mongoose.disconnect(config.mongoUri);
}

export default lambdaHandler;

import { SQSHandler } from 'aws-lambda';
import { worker } from 'indexer-serverless';
import handler from '../handler';

const lambda: SQSHandler = async (event) => {
  await worker(event, handler);
};

export default lambda;

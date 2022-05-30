import { SQSHandler } from 'aws-lambda';
import { worker } from 'indexer-serverless';
import indexer from '../indexer';

const lambda: SQSHandler = async (event) => {
  await worker(event, indexer);
};

export default lambda;

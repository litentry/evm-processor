import { Handler } from 'aws-lambda';
import { producer } from 'indexer-serverless';
import { query } from 'indexer-utils';

const lambda: Handler = async () => producer(query.tokenActivity.latestBlock);

export default lambda;

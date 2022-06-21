import { Context, Handler } from 'aws-lambda';
import { producer } from 'indexer-serverless';
import { query } from 'indexer-utils';

const lambda: Handler = async (event: any, context: Context) =>
  producer(event, query.tokenActivity.latestBlock);

export default lambda;

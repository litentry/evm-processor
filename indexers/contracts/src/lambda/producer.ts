import { Context, Handler } from 'aws-lambda';
import { producer } from 'indexer-serverless';
import { query } from 'indexer-utils';

const lambda: Handler = async (event: any, context: Context) =>
  producer(event, query.archive.latestBlock);

export default lambda;

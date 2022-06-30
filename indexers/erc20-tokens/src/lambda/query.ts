import { Handler } from 'aws-lambda';
import { query } from 'indexer-serverless';
import schema from '../schema';

const lambda: Handler = async (event, context) => query(event, context, schema);

export default lambda;

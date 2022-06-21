import { Context, Handler } from 'aws-lambda';
import { producer } from 'indexer-serverless';
import { web3 } from 'indexer-utils';

const lambda: Handler = async (
  event: any,
  context: Context
) => producer(event, web3().eth.getBlockNumber);

export default lambda;

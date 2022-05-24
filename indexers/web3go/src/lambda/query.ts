import { Handler } from 'aws-lambda';

const lambda: Handler = async (event, context) => {
  // web3go indexer is the only one without a graph, but our serverless build requires a lambda here
};

export default lambda;

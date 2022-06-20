import serverlessExpress from '@vendia/serverless-express';
import { Context } from 'aws-lambda';
import { GraphQLSchema } from 'graphql';
import { metrics, monitoring } from 'indexer-monitoring';
import { graphqlServer } from 'indexer-utils';
import mongoose from 'mongoose';

let serverlessExpressInstance: any;

export default async function query(
  event: any,
  context: Context,
  schema: GraphQLSchema,
) {
  try {
    monitoring.markStart(metrics.lambdaQuerySuccess);

    if (!serverlessExpressInstance) {
      await mongoose.connect(process.env.MONGO_URI!);
      const app = graphqlServer(schema);
      serverlessExpressInstance = serverlessExpress({ app });
    }

    const res = serverlessExpressInstance(event, context);

    monitoring.markEndAndMeasure(metrics.lambdaQuerySuccess);

    return res;
  } catch (error) {
    console.log(error);
    monitoring.incCounter(1, metrics.lambdaQueryFailure);

    throw error;
  } finally {
    await monitoring.pushMetrics();
  }
}

import mongoose from 'mongoose';
import { Context } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { graphqlServer } from 'indexer-utils';
import { GraphQLSchema } from 'graphql';

let serverlessExpressInstance: any;

export default async function query(
  event: any,
  context: Context,
  schema: GraphQLSchema
) {
  if (!serverlessExpressInstance) {
    await mongoose.connect(process.env.MONGO_URI!);
    const app = graphqlServer(schema);
    serverlessExpressInstance = serverlessExpress({ app });
  }

  return serverlessExpressInstance(event, context);
}

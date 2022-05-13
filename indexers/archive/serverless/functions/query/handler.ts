import serverlessExpress from '@vendia/serverless-express';
import { graphqlServer } from 'indexer-utils';
import schema from '@app/schema';
import config from '../../../src/config';
import mongoose from 'mongoose';
let serverlessExpressInstance;

export default async (event, context) => {
  if (!serverlessExpressInstance) {
    await mongoose.connect(config.mongoUri);
    const app = graphqlServer(schema);
    serverlessExpressInstance = serverlessExpress({ app });
  }

  return serverlessExpressInstance(event, context);
};

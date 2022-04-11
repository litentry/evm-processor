import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import mongoose from 'mongoose';
import schema from './schema';
import config from './config';

if (!config.mongoUri) {
  throw new Error('query-node requires process.env.MONGO_URI');
}

(async () => {
  await mongoose.connect(config.mongoUri!);

  const app = express();
  app.use(
    '/graphql',
    graphqlHTTP(() => {
      return {
        schema,
        graphiql: { headerEditorEnabled: true },
      };
    })
  );
  app.listen(config.port, () => {
    console.log(`Query node listening on port: ${config.port}`);
  });
})();

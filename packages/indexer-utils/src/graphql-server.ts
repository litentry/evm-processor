import express from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLSchema } from 'graphql';

export default function graphqlServer(schema: GraphQLSchema) {
  const app = express();

  console.log('creating graphql express server');

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(
    '/graphql',
    graphqlHTTP(() => ({
      schema,
      graphiql: { headerEditorEnabled: true },
    })),
  );
  return app;
}

import express from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLSchema } from 'graphql';

export default function graphqlServer(schema: GraphQLSchema, port?: number) {
  const app = express();

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(
    '/graphql',
    graphqlHTTP(() => ({
      schema,
      graphiql: { headerEditorEnabled: true },
    })),
  );

  if (port) {
    app.listen(port, () => {
      console.log(`Graphql server listening on port: ${port}`);
    });
  }

  return app;
}

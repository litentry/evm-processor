import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLSchema } from 'graphql';

export default async function graphqlServer(
  schema: GraphQLSchema,
  port: number
) {
  const app = express();
  app.use(
    '/graphql',
    graphqlHTTP(() => ({
      schema,
      graphiql: { headerEditorEnabled: true },
    }))
  );
  app.listen(port, () => {
    console.log(`Graphql server listening on port: ${port}`);
  });
}

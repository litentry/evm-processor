import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './typeDefs';
import Query from './query';

export default makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query,
  },
});

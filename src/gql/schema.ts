import { makeExecutableSchema } from '@graphql-tools/schema';

//
import typeDefs from './typeDefs';
import resolvers from './resolvers';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// console.log({ schema });

export default schema;

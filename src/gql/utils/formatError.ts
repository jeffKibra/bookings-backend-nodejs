import { GraphQLError } from 'graphql';

export default function formatError(err: GraphQLError) {
  console.log('format gql error:', { err });

  const { locations, message, path } = err;

  return { message: message, locations: locations, path };
}

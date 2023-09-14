import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
//
import { IGQLContext } from '../../../types';

export default function isAuthenticated() {
  return (next: GraphQLFieldResolver<any, any, any>) => {
    return function func2(
      parent: unknown,
      args: unknown,
      context: IGQLContext,
      info: GraphQLResolveInfo
    ) {
      console.log('checking if request is authenticated before proceeding...');

      return next(parent, args, context, info);
    };
  };
}

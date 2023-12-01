import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
//
import { IGQLContext } from '../../../../types';

export default function checkOrgId() {
  return (next: GraphQLFieldResolver<any, any, any>) => {
    return function func2(
      parent: unknown,
      args: unknown,
      context: IGQLContext,
      info: GraphQLResolveInfo
    ) {
      const orgId = context?.orgId;
      console.log('checking orgId before proceeding...', orgId);

      if (!orgId) {
        throw new Error(`Invalid OrgId: ${orgId} found. Must be a string!`);
      }

      return next(parent, args, context, info);
    };
  };
}

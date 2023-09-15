import { graphqlHTTP } from 'express-graphql';
import { Response, NextFunction } from 'express';

//
import { schema, gqlUtils } from '../gql';
//
import { ICustomRequest } from '../types';

export default function graphqlMiddleware(
  req: ICustomRequest,
  res: Response,
  next: NextFunction
) {
  //check authentication
  const context = req?.appContext;
  console.log('graphqlMiddleware', { context });

  const gqlMiddleware = graphqlHTTP({
    schema,
    context: { ...context },
    graphiql: true,
    // customFormatErrorFn: gqlUtils.formatError,
  });

  return gqlMiddleware(req, res);
}

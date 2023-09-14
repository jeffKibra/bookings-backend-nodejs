import { graphqlHTTP } from 'express-graphql';
import { Response, NextFunction } from 'express';

//
import { schema } from '../gql';
//
import { IAuthRequest } from '../types';

export default function graphqlMiddleware(
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) {
  //check authentication
  const auth = req?.auth || {};
  console.log({ auth });

  const gqlMiddleware = graphqlHTTP({
    schema,
    context: { auth },
    graphiql: true,
  });

  return gqlMiddleware(req, res);
}

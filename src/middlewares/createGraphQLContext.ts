import { Response, NextFunction } from 'express';
//
import { decodeFirebaseAuthToken } from '../auth';
//
import { handleError } from '../utils';
//
import { ICustomRequest, IAuth } from '../types';

//

async function getAuthForContext(token?: string) {
  const decodedToken = await decodeFirebaseAuthToken(token);

  if (!decodedToken) {
    return;
  }

  const { uid } = decodedToken;

  const userAuth: IAuth = {
    uid,
    token: { ...decodedToken },
  };

  return userAuth;
}

export default async function createGraphQLContext(
  req: ICustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('orgId middleware...');

    const headers = req.headers;
    // console.log({ headers });
    const bearerToken = headers.authorization;
    const token = bearerToken?.split(' ')[1];

    const contextAuth = await getAuthForContext(token);
    //
    const orgId = req.get('org-id');
    console.log({ orgId });

    const currentContext = req.appContext || {};
    req.appContext = { ...currentContext, orgId, auth: contextAuth };

    next();
  } catch (err: unknown) {
    handleError(err, 'Error Retrieving orgId from headers ', false);
    //proceed to error handling middleware
    next(err);
  }
}

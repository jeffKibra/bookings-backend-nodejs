import { Response, NextFunction } from 'express';
//
import { auth } from '../auth';
//
import { handleError } from '..//utils';
//
import { IAuthRequest, IAuth } from '../types';

//

export default async function checkAuth(
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('auth middleware...');

    const authHeader = req.headers.authorization;

    const token = authHeader?.split(' ')[1];

    let userAuth: IAuth | undefined = undefined;

    if (token) {
      //confirm with firebase if auth token is valid
      const decodedToken = await auth.verifyIdToken(token);
      // console.log('decoded token: ', decodedToken);
      const { uid } = decodedToken;

      userAuth = {
        uid,
        token: { ...decodedToken },
      };
    }

    // console.log('userAuth: ', userAuth);

    req.auth = userAuth;

    //proceed to next middleware...
    // next(new Error('Error test'));
    next();
  } catch (err: unknown) {
    handleError(err, 'Error Validating Auth Credentials', false);
    //proceed to error handling middleware
    next(err);
  }
}

import { Response, NextFunction } from 'express';

//
import { IAuthRequest } from '../types';

export default function checkAuth(
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) {
  console.log('auth middleware...');

  req.auth = {
    token: { uid: 'user_id_1234567890' },
    uid: 'user_id_1234567890',
  };

  next();
}

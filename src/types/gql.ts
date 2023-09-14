import { Request } from 'express';
//
import { IAuth } from './auth';

export interface IAuthRequest extends Request {
  auth?: IAuth;
}

export interface IGQLContext {
  auth?: IAuth;
}

export type IGQLResolver<T> = (
  parent: unknown | undefined,
  args: unknown | undefined,
  context: IGQLContext | undefined,
  info: unknown | undefined
) => T;

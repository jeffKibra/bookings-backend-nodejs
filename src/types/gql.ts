import { Request } from 'express';
//
import { IAuth } from './auth';

export interface IGQLContext {
  auth?: IAuth;
  orgId?: string;
}
export interface ICustomRequest extends Request {
  appContext?: IGQLContext;
}

export type IGQLResolver<T> = (
  parent: unknown | undefined,
  args: unknown | undefined,
  context: IGQLContext | undefined,
  info: unknown | undefined
) => T;

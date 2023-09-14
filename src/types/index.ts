export type { IAuth, IUserToken } from './auth';

export * from './gql';

export type ISimpleFunc<T> = (args: unknown[]) => T;

export type IBook = {
  name: string;
  id: string;
  genre: string;
  authorId: string;
};

export type IAuthor = {
  name: string;
  age: number;
  id: string;
};

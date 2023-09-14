export interface IUserToken {
  uid: string;
}

export interface IAuth {
  uid: string;
  token: IUserToken;
}

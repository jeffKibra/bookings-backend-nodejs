//
interface IAccountMetaData {
  orgId: string;
  status: number;
  createdAt: Date | string;
  createdBy: string;
  modifiedAt: Date | string;
  modifiedBy: string;
}
//

export type IAccountType = {
  name: string;
  id: string;
  main: 'asset' | 'liability' | 'equity' | 'expense' | 'income';
};

export interface IAccountFormData {
  name: string;
  accountType: IAccountType;
  description?: string;
}

export interface IAccountFromDb extends IAccountFormData {
  tags: string[];
  metaData: IAccountMetaData;
}

export interface IAccount extends IAccountFromDb {
  _id: string;
}

export interface IAccountSummary
  extends Pick<IAccount, 'name' | 'accountType'> {
  accountId: string;
}

//
export type IAccountMapping = {
  accountId: string;
  current: number;
  incoming: number;
};

export type IAccountsMapping = {
  uniqueAccounts: IAccountMapping[];
  similarAccounts: IAccountMapping[];
  updatedAccounts: IAccountMapping[];
  deletedAccounts: IAccountMapping[];
  newAccounts: IAccountMapping[];
};

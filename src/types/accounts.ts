import { FieldValue } from "firebase-admin/firestore";
export type AccountType = {
  name: string;
  id: string;
  main: "asset" | "liability" | "equity" | "expense" | "income";
};
export type Account = {
  name: string;
  accountId: string;
  accountType: AccountType;
};

export type AccountMapping = {
  accountId: string;
  current: number;
  incoming: number;
};

export type AccountsMapping = {
  uniqueAccounts: AccountMapping[];
  similarAccounts: AccountMapping[];
  updatedAccounts: AccountMapping[];
  deletedAccounts: AccountMapping[];
  newAccounts: AccountMapping[];
};

export interface AccountFormData {
  name: string;
  accountType: AccountType;
  description: string;
}

export interface AccountFromDb extends AccountFormData {
  tags: string[];
  accountId: string;
  status: number;
  createdAt: FieldValue;
  createdBy: string;
  modifiedAt: FieldValue;
  modifiedBy: string;
}

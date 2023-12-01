import { ITax, IAccount } from ".";

export interface ExpenseItem {
  amount: number;
  details: string;
  itemRate: number;
  itemTax: number;
  tax: ITax;
  account: IAccount;
}

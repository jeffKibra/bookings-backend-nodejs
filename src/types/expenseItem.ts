import { Tax, Account } from ".";

export interface ExpenseItem {
  amount: number;
  details: string;
  itemRate: number;
  itemTax: number;
  tax: Tax;
  account: Account;
}

import { Timestamp } from "firebase-admin/firestore";
import {
  PaymentMode,
  IAccount,
  ExpenseItem,
  IContactSummary,
  TransactionTypes,
} from ".";

export interface ExpenseSummary {
  expenseTaxes: [];
  subTotal: number;
  totalAmount: number;
  totalTax: number;
}

export interface ExpenseFormData {
  paymentMode: PaymentMode;
  reference: string;
  taxType: string;
  vendor?: IContactSummary;
  paymentAccount: IAccount;
  items: ExpenseItem[];
  expenseDate: Date;
  summary: ExpenseSummary;
}

interface Meta {
  createdAt: Date | Timestamp;
  createdBy: string;
  modifiedAt: Date | Timestamp;
  modifiedBy: string;
  status: number;
  orgId: string;
  transactionType: keyof Pick<TransactionTypes, "expense">;
}

export interface ExpenseFromDb extends Required<ExpenseFormData>, Meta {}

export interface Expense extends ExpenseFromDb {
  expenseId: string;
}

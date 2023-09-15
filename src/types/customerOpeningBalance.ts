import { Timestamp } from "firebase-admin/firestore";
import {
  CustomerOpeningBalanceTransactionType,
  InvoicePayments,
  OrgSummary,
  IContactSummary,
} from ".";

interface Meta {
  transactionType: keyof CustomerOpeningBalanceTransactionType;
  balance: number;
  isSent: boolean;
  paymentsCount: number;
  paymentsIds: string[];
  paymentsReceived: InvoicePayments;
  status: number;
  org: OrgSummary;
  createdAt: Date | Timestamp;
  createdBy: string;
  modifiedAt: Date | Timestamp;
  modifiedBy: string;
}

export interface CustomerOpeningBalanceForm {
  customer: IContactSummary;
  amount: number;
}

export interface CustomerOpeningBalanceFromDb
  extends CustomerOpeningBalanceForm,
    Meta {}

export interface CustomerOpeningBalance extends CustomerOpeningBalanceFromDb {
  openingBalanceId: string;
}

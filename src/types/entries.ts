import { Timestamp } from "firebase-admin/firestore";
import {
  Account,
  DateDetails,
  AccountMapping,
  TransactionTypes,
  IContactSummary,
} from ".";

export interface GroupedEntries {
  [key: string]: Entry[];
}

export interface MappedEntry extends Entry, AccountMapping {}

export interface Entry {
  amount: number;
  entryType: "credit" | "debit";
  account: Account;
  createdAt: Date | Timestamp;
  createdBy: string;
  date: DateDetails;
  modifiedAt: Date | Timestamp;
  modifiedBy: string;
  status: number;
  orgId: string;
  transactionId: string;
  contacts: IContactSummary[];
  contactsIds: string[];
  transactionType: keyof TransactionTypes;
}

export interface InvoicePaymentEntry {
  current: number;
  incoming: number;
  invoiceId: string;
  entry: Entry;
}

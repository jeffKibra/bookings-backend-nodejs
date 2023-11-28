import {
  IAccountSummary,
  // DateDetails,
  IAccountMapping,
  TransactionTypes,
  IContactSummary,
} from '.';

export interface IGroupedEntries {
  [key: string]: IJournalEntry[];
}

interface IJournalEntryMetaData {
  createdAt: Date | string;
  createdBy: string;
  modifiedAt: Date | string;
  modifiedBy: string;
  status: number;
  orgId: string;
  transactionType: keyof TransactionTypes;
}

export interface IMappedEntry extends IJournalEntry, IAccountMapping {}

export interface IJournalEntry {
  amount: number;
  entryType: 'credit' | 'debit';
  account: IAccountSummary;
  // date: DateDetails;
  date: Record<string, unknown>;
  transactionId: string;
  contact: IContactSummary;
  // contactsIds: string[];
  metaData: IJournalEntryMetaData;
}

// export interface IInvoicePaymentEntry {
//   current: number;
//   incoming: number;
//   invoiceId: string;
//   entry: IJournalEntry;
// }

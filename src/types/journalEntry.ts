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

interface ILastValueProcessed {
  org: number;
  contact: number;
}

export interface IMappedEntry extends IJournalEntry, IAccountMapping {}

export type IJournalEntryType = 'credit' | 'debit';

// export interface IAdjustment {
//   value: number;
//   timestamp: Date | number;
//   processedByOrg: number;
//   processedByContact: number;
//   contactId: string;
//   accountId: string;
//   entryType: IJournalEntryType;
// }

export interface IJournalEntry {
  transactionId: string;
  entryId: string;
  amount: number;
  entryType: IJournalEntryType;
  account: IAccountSummary;
  // date: Record<string, unknown>;
  contact: IContactSummary;
  lastValueProcessed?: ILastValueProcessed;
  // transactionType: keyof TransactionTypes;
  metaData: IJournalEntryMetaData;
}

// export interface IInvoicePaymentEntry {
//   current: number;
//   incoming: number;
//   invoiceId: string;
//   entry: IJournalEntry;
// }

// export type IJournalEntryActionType = 'CREATE' | 'UPDATE' | null;

// export interface IJournalEntryInitPayload {
//   userId: string;
//   orgId: string;
//   transactionId: string;
//   action: IJournalEntryActionType;
//   entriesMapping: [];
// }

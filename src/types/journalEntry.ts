import {
  IAccountSummary,
  // DateDetails,
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
  // transactionType: keyof TransactionTypes;
}

interface ILastValueProcessed {
  org: number;
  contact: number;
}

// export interface IMappedEntry extends IJournalEntry, IAccountMapping {}

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

export interface IJournalEntryFormData {
  account: IAccountSummary;
  entryId: string; //secondary id
  amount: number;
  contact?: IContactSummary;
  entryType: IJournalEntryType;
  transactionType: keyof TransactionTypes;
}

export interface IJournalEntry extends IJournalEntryFormData {
  transactionId: string;
  lastValueProcessed?: ILastValueProcessed;
  // transactionType: keyof TransactionTypes;
  metaData: IJournalEntryMetaData;
}

export interface IJournalEntryMapping
  extends Omit<IJournalEntryFormData, 'amount'> {
  incoming: number;
  current: number;
}

export interface IJournalEntryMappingResult {
  entriesToCreate: IJournalEntryMapping[];
  entriesToUpdate: IJournalEntryMapping[];
  entriesToDelete: IJournalEntryMapping[];
  similarEntries: IJournalEntryMapping[];
  uniqueEntries: IJournalEntryMapping[];
}

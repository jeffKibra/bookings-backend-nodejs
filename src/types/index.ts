export * from './gql';
export * from './auth';
export * from './monthlyBookings';

export * from './queries';
export * from './searchResults';
export * from './searchVehiclesResults';
export * from './searchBookingsResults';
export * from './search';
export * from './sortBy';

export * from './vehicles';
export * from './bookings';
export * from './pagination';

export * from './sale';
export * from './invoice';
export * from './contacts';
export * from './accounts';
//
export type { OrgSummary, Org, OrgFormData, OrgFromDb } from './org';
// export type { UserProfile, LoginForm, SignupForm } from "./auth";
// export type {} from
// Customer,
// CustomerSummary,
// CustomerFromDb,
// CustomerFormData,
// './customer';

export type {
  Entry,
  GroupedEntries,
  MappedEntry,
  InvoicePaymentEntry,
} from './entries';
export type { Tax, TaxForm, TaxFromDb, TaxSummary } from './tax';

export type { ExpenseItem } from './expenseItem';
export type { PaymentMode } from './paymentMode';
export type { PaymentTerm } from './paymentTerm';

export type {
  PaymentReceived,
  PaymentReceivedFromDb,
  PaymentReceivedForm,
  InvoicesPayments,
  InvoicePaymentMapping,
  PaymentWithInvoices,
  IBookingPaymentMapping,
  IBookingsPayments,
  IPaymentWithBookings,
} from './paymentReceived';
export type { DailySummary } from './dailySummary';
export type {
  Expense,
  ExpenseFormData,
  ExpenseFromDb,
  ExpenseSummary,
} from './expense';
export type {
  TransactionTypes,
  InvoiceTransactionTypes,
  SaleTransactionTypes,
  CustomerOpeningBalanceTransactionType,
} from './transactionTypes';
export type {
  CustomerOpeningBalanceForm,
  CustomerOpeningBalance,
  CustomerOpeningBalanceFromDb,
} from './customerOpeningBalance';
// export type { DateDetails } from './others';

// export type {
//   IManualJournalEntry,
//   IAccountFromManualJournalEntries,
//   IManualJournalForm,
//   IManualJournalFormSummary,
//   IManualJournalSummaryEntry,
//   IManualJournalTaxEntry,
//   IManualJournal,
//   IManualJournalFromDb,
// } from './manualJournals';

export type { OneOfType } from './oneOfType';

export type MakeAllFieldsOptional<T> = {
  [Property in keyof T]?: T[Property] extends Record<string, unknown>
    ? MakeAllFieldsOptional<T[Property]>
    : T[Property];
};

export type MakeAllFieldsRequired<T> = {
  [Property in keyof T]-?: T[Property];
};

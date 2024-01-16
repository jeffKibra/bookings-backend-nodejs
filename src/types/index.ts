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
export * from './vehicleMake';
export * from './vehicleModel';
//
export * from './bookings';
export * from './pagination';

export * from './sale';
export * from './invoice';
export * from './paymentReceived';
export * from './contacts';
export * from './accounts';
export * from './address';
export * from './org';
export * from './tax';
export * from './journalEntry';
//
export * from './paymentMode';
export * from './paymentTerm';
//
export * from './transactionTypes';
//
// export type { UserProfile, LoginForm, SignupForm } from "./auth";
// export type {} from
// Customer,
// CustomerSummary,
// CustomerFromDb,
// CustomerFormData,
// './customer';

export type { ExpenseItem } from './expenseItem';

export type { DailySummary } from './dailySummary';
export type {
  Expense,
  ExpenseFormData,
  ExpenseFromDb,
  ExpenseSummary,
} from './expense';

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

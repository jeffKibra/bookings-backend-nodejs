import { createCollection } from ".";

import { dbCollectionsPaths } from "../../constants";

import {
  IContactFromDb,
  ExpenseFromDb,
  InvoiceFromDb,
  ItemFromDb,
  Entry,
  PaymentReceivedFromDb,
  SaleReceiptFromDb,
  TaxFromDb,
  IManualJournalFromDb,
  IBookingFromDb,
} from "../../types";

export default function dbCollections(orgId: string) {
  const org = `organizations/${orgId}`;
  return {
    contacts: createCollection<IContactFromDb>(
      dbCollectionsPaths.contacts(orgId)
    ),
    expenses: createCollection<ExpenseFromDb>(`${org}/expenses`),
    invoices: createCollection<InvoiceFromDb>(`${org}/invoices`),
    bookings: createCollection<IBookingFromDb>(`${org}/bookings`),
    monthlyBookings: createCollection<Record<string, string[]>>(
      `${org}/monthlyBookings`
    ),
    items: createCollection<ItemFromDb>(`${org}/items`),
    entries: createCollection<Entry>(`${org}/journals`),
    paymentsReceived: createCollection<PaymentReceivedFromDb>(
      `${org}/payments`
    ),
    saleReceipts: createCollection<SaleReceiptFromDb>(`${org}/saleReceipts`),
    taxes: createCollection<TaxFromDb>(`${org}/taxes`),
    manualJournals: createCollection<IManualJournalFromDb>(
      `${org}/manualJournals`
    ),
    //     customers: createCollection<Customer>(`${org}/customers`),
    //     customers: createCollection<Customer>(`${org}/customers`),
    //     customers: createCollection<Customer>(`${org}/customers`),
  };
}

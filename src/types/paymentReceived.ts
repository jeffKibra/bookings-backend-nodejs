import { Decimal128, ObjectId } from 'mongodb';

import {
  IContactSummary,
  IAccountSummary,
  PaymentMode,
  TransactionTypes,
  IInvoice,
  IBooking,
  ISearchQueryOptions,
} from '.';

interface IMeta {
  createdAt: Date | string;
  createdBy: string;
  modifiedAt: Date | string;
  modifiedBy: string;
  status: number;
  orgId: string;
  transactionType: keyof Pick<TransactionTypes, 'customer_payment'>;
  // paidInvoicesIds: string[];
}

export interface IPaidInvoiceFromDb {
  invoiceId: string;
  amount: Decimal128;
}

export interface IPaidInvoice extends Omit<IPaidInvoiceFromDb, 'amount'> {
  amount: number;
}

export interface IPaymentReceivedForm {
  account: IAccountSummary;
  amount: number;
  customer: IContactSummary;
  paymentDate: Date;
  paymentMode: PaymentMode;
  reference: string;
  paidInvoices: IPaidInvoice[];
  // payments: { [key: string]: number };
}

export interface IPaymentReceived extends IPaymentReceivedForm {
  _id: string;
  excess: number;
  metaData: IMeta;
}

export interface IPaymentReceivedFromDb
  extends Omit<IPaymentReceived, '_id' | 'amount' | 'excess' | 'paidInvoices'> {
  _id: ObjectId;
  amount: Decimal128;
  excess: Decimal128;
  paidInvoices: IPaidInvoiceFromDb[];
}

export interface IPaidInvoiceMapping {
  incoming: number;
  current: number;
  invoiceId: string;
}

// export interface InvoicesPayments {
//   [key: string]: number;
// }

export interface PaymentWithInvoices extends IPaymentReceived {
  invoices: IInvoice[];
}

// export interface IPaymentWithBookings extends PaymentReceived {
//   bookings: IBooking[];
// }

export interface IPaymentsReceivedQueryOptions extends ISearchQueryOptions {}

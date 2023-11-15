import { Timestamp } from 'firebase-admin/firestore';
import {
  IContactSummary,
  IAccountSummary,
  PaymentMode,
  TransactionTypes,
  IInvoice,
  IBooking,
} from '.';

interface Meta {
  createdAt: Date | Timestamp;
  createdBy: string;
  modifiedAt: Date | Timestamp;
  modifiedBy: string;
  status: number;
  orgId: string;
  transactionType: keyof Pick<TransactionTypes, 'customer_payment'>;
  paidInvoicesIds: string[];
  excess: number;
}

export interface PaymentReceivedForm {
  account: IAccountSummary;
  amount: number;
  customer: IContactSummary;
  paymentDate: Date;
  paymentMode: PaymentMode;
  reference: string;
  payments: { [key: string]: number };
}

export interface PaymentReceivedFromDb extends PaymentReceivedForm, Meta {}

export interface PaymentReceived extends PaymentReceivedFromDb {
  paymentId: string;
}

export interface IInvoicePaymentMapping {
  incoming: number;
  current: number;
  _id: string;
}

export interface InvoicesPayments {
  [key: string]: number;
}

export interface IInvoicesPayments {
  [key: string]: number;
}

export interface PaymentWithInvoices extends PaymentReceived {
  invoices: IInvoice[];
}

// export interface IPaymentWithBookings extends PaymentReceived {
//   bookings: IBooking[];
// }

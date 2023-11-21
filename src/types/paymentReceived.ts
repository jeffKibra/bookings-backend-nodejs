import { Timestamp } from 'firebase-admin/firestore';
import {
  IContactSummary,
  IAccountSummary,
  PaymentMode,
  TransactionTypes,
  IInvoice,
  IBooking,
} from '.';

interface IMeta {
  createdAt: Date | Timestamp;
  createdBy: string;
  modifiedAt: Date | Timestamp;
  modifiedBy: string;
  status: number;
  orgId: string;
  transactionType: keyof Pick<TransactionTypes, 'customer_payment'>;
  // paidInvoicesIds: string[];
}

export interface IInvoicePayment {
  invoiceId: string;
  amount: number;
}

export interface IPaymentReceivedForm {
  account: IAccountSummary;
  amount: number;
  customer: IContactSummary;
  paymentDate: Date;
  paymentMode: PaymentMode;
  reference: string;
  paidInvoices: IInvoicePayment[];
  // payments: { [key: string]: number };
}

export interface IPaymentReceivedFromDb extends IPaymentReceivedForm {
  excess: number;
  metaData: IMeta;
}

export interface IPaymentReceived extends IPaymentReceivedFromDb {
  paymentId: string;
}

export interface IInvoicePaymentMapping {
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

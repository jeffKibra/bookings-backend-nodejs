import {
  IBookingForm,
  InvoiceTransactionTypes,
  PaymentTerm,
  IContactSummary,
  IBookingItem,
  ISaleItem,
  ISaleForm,
  ISaleMeta,
  ISearchQueryOptions,
} from '.';
import { Timestamp } from 'firebase-admin/firestore';

// export interface InvoicePayment {
//   account: Account;
//   amount?: number;
//   customerId: string;
//   excess: number;
//   paidInvoicesIds: string[];
//   paymentAmount: number;
//   paymentDate: Date;
//   paymentId: string;
//   paymentMode: PaymentMode;
//   payments: { [key: string]: number };
//   reference: string;
//   status: string;
// }

export interface InvoicePayments {
  [key: string]: number;
}

interface IMeta extends ISaleMeta {
  transactionType: keyof InvoiceTransactionTypes;
  // balance: number;
  // isSent: boolean;
  // isOverdue: boolean;
  // overdueAt?: Timestamp;
  // paymentsCount: number;
  // paymentsIds: string[];
  // paymentsReceived: InvoicePayments;
}

export interface IInvoiceForm extends ISaleForm {
  customer: IContactSummary;
  customerNotes: string;
  dueDate: Date | string;

  paymentTerm: PaymentTerm;
  //
  // downPayment: IBookingDownPayment;
}

export interface IInvoiceFromDb extends IInvoiceForm {
  balance: number;
  metaData: IMeta;
}

export interface IInvoice extends IInvoiceFromDb {
  _id: string;
}

export interface IInvoiceSummary
  extends Pick<IInvoice, '_id' | 'total' | 'dueDate'> {
  // balance: IInvoice['balance'];
  // dueDate: IInvoice['dueDate'];
  // saleDate: IInvoice['saleDate'];
  // status: IInvoice['status'];
  // transactionType: IInvoice['transactionType'];
  // bookingTotal: IInvoice['bookingTotal'];
  // total: IInvoice['total'];
}

export interface IInvoicesQueryOptions extends ISearchQueryOptions {}

import { Decimal128, ObjectId } from 'mongodb';

import {
  IBookingForm,
  InvoiceTransactionTypes,
  IPaymentTermSummary,
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

  paymentTerm: IPaymentTermSummary;
  //
  // downPayment: IBookingDownPayment;
}

export interface IInvoicePayment {
  paymentId: string;
  amount: number;
}

export interface IInvoicePaymentsResult {
  list: IInvoicePayment[];
  total: number;
}

export interface IInvoiceFromDb
  extends Omit<IInvoiceForm, 'subTotal' | 'totalTax' | 'total'> {
  payments?: IInvoicePayment[];
  paymentsTotal: number;
  balance: number;
  metaData: IMeta;
  //
  _id: ObjectId;
  //
  subTotal: Decimal128;
  totalTax: Decimal128;
  total: Decimal128;
}

export interface IInvoice
  extends Omit<IInvoiceFromDb, 'subTotal' | 'totalTax' | 'total' | '_id'> {
  _id: string;
  //
  subTotal: number;
  totalTax: number;
  total: number;
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

export interface IInvoicesQueryOptions extends ISearchQueryOptions {
  customerId?: string;
  paymentId?: string;
}

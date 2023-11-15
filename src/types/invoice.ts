import {
  IBookingForm,
  InvoiceTransactionTypes,
  PaymentTerm,
  IContactSummary,
  IBookingItem,
  ISaleItem,
  ISaleForm,
  ISaleMeta,
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
  isSent: boolean;
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
  metaData: IMeta;
}

interface IInvoiceId {
  id: string;
}
export interface IInvoice extends IInvoiceFromDb, IInvoiceId {}

export interface IInvoiceSummary extends IInvoiceId {
  // balance: IInvoice['balance'];
  dueDate: IInvoice['dueDate'];
  // saleDate: IInvoice['saleDate'];
  // status: IInvoice['status'];
  // transactionType: IInvoice['transactionType'];
  // bookingTotal: IInvoice['bookingTotal'];
  total: IInvoice['total'];
}

import {
  IBookingForm,
  InvoiceTransactionTypes,
  PaymentTerm,
  IContactSummary,
  IBookingItem,
  ISaleItem,
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

interface IMeta {
  transactionType: keyof InvoiceTransactionTypes;
  // balance: number;
  isSent: boolean;
  // isOverdue: boolean;
  // overdueAt?: Timestamp;
  // paymentsCount: number;
  // paymentsIds: string[];
  // paymentsReceived: InvoicePayments;
  status: number;
  orgId: string;
  createdAt: Date | String;
  createdBy: string;
  modifiedAt: Date | String;
  modifiedBy: string;
}

export interface IInvoiceForm {
  customer: IContactSummary;
  customerNotes: string;
  items: ISaleItem[];
  invoiceDate: Date | string;
  dueDate: Date | string;
  //
  paymentTerm: PaymentTerm;
  //
  taxType?: 'inclusive' | 'exclusive';
  discount?: number;
  taxes?: string[];
  totalTax?: number;
  subTotal: number;
  total: number;
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

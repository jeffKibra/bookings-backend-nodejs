import { IBookingForm, InvoiceTransactionTypes, PaymentTerm } from ".";
import { Timestamp } from "firebase-admin/firestore";

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

interface Meta {
  transactionType: keyof InvoiceTransactionTypes;
  balance: number;
  isSent: boolean;
  isOverdue: boolean;
  overdueAt?: Timestamp;
  paymentsCount: number;
  paymentsIds: string[];
  paymentsReceived: InvoicePayments;
  status: number;
  orgId: string;
  createdAt: Date | Timestamp;
  createdBy: string;
  modifiedAt: Date | Timestamp;
  modifiedBy: string;
}

export interface InvoiceFormData extends IBookingForm {
  dueDate: Date;
  paymentTerm: PaymentTerm;
}

export interface InvoiceFromDb extends InvoiceFormData, Meta {}

interface InvoiceId {
  id: string;
}
export interface Invoice extends InvoiceFromDb, InvoiceId {}

export interface InvoiceSummary extends InvoiceId {
  balance: Invoice["balance"];
  dueDate: Invoice["dueDate"];
  saleDate: Invoice["saleDate"];
  status: Invoice["status"];
  transactionType: Invoice["transactionType"];
  bookingTotal: Invoice["bookingTotal"];
  total: Invoice["total"];
}

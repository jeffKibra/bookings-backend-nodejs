import { Decimal128, ObjectId } from 'mongodb';

import {
  IContactSummary,
  IAccountSummary,
  PaymentMode,
  TransactionTypes,
  PaymentTransactionTypes,
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
  // allocationsIds: string[];
}

export interface IUserPaymentAllocation {
  invoiceId: string;
  amount: number;
  transactionType?: keyof PaymentTransactionTypes;
}

export interface IPaymentAllocation extends Required<IUserPaymentAllocation> {}

export interface IPaymentAllocationFromDb
  extends Omit<IPaymentAllocation, 'amount'> {
  amount: Decimal128;
}

export interface IUserPaymentReceivedForm {
  // account: IAccountSummary;
  amount: number;
  customer: IContactSummary;
  paymentDate: Date;
  paymentMode: PaymentMode;
  reference: string;
  allocations: IUserPaymentAllocation[];
  // allocations: IPaymentAllocation[];
  // payments: { [key: string]: number };
}

export interface IPaymentReceivedForm
  extends Omit<IUserPaymentReceivedForm, 'allocations'> {
  allocations: IPaymentAllocation[];
}

export interface IPaymentReceived extends IPaymentReceivedForm {
  _id: string;
  excess: number;
  metaData: IMeta;
}

export interface IPaymentReceivedFromDb
  extends Omit<IPaymentReceived, '_id' | 'amount' | 'excess' | 'allocations'> {
  _id: ObjectId;
  amount: Decimal128;
  excess: Decimal128;
  allocations: IPaymentAllocationFromDb[];
}

export interface IPaymentAllocationMapping
  extends Pick<IPaymentAllocation, 'transactionType'> {
  ref: string; //invoiceId or 'excess'
  incoming: number;
  current: number;
}

export interface IPaymentAllocationMappingResult {
  allocationsToCreate: IPaymentAllocationMapping[];
  allocationsToUpdate: IPaymentAllocationMapping[];
  allocationsToDelete: IPaymentAllocationMapping[];
  similarAllocations: IPaymentAllocationMapping[];
  uniqueAllocations: IPaymentAllocationMapping[];
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

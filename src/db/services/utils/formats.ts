import { Timestamp } from "firebase-admin/firestore";

//
import { Invoice, PaymentReceived, Org, IContactSummary } from "../types";

function formatInvoices(invoices: Invoice[]) {
  return invoices.map((invoice) => {
    const {
      saleDate,
      dueDate,
      total,
      bookingTotal,
      transferAmount,
      status,
      id,
      balance,
      transactionType,
    } = invoice;
    return {
      saleDate,
      dueDate,
      total,
      bookingTotal,
      transferAmount,
      status,
      id,
      balance,
      transactionType,
    };
  });
}

function formatInvoicePayment(payment: PaymentReceived) {
  const { paymentDate, reference, paymentMode, account, amount, paymentId } =
    payment;

  return {
    paymentDate,
    reference,
    paymentMode,
    account,
    amount,
    paymentId,
  };
}

function formatOrgData(org: Org) {
  const { orgId, businessType, name } = org;

  return { orgId, businessType, name };
}

interface TransactionDetails {
  createdAt?: Date | Timestamp;
  createdBy?: string;
  modifiedAt: Date | Timestamp;
  modifiedBy?: string;
  customer: IContactSummary;
  paidInvoices: Invoice[];
  org: Org;
  [key: string]: unknown;
}

function formatTransactionDetails(details: TransactionDetails) {
  const {
    //  createdAt, createdBy, modifiedAt, modifiedBy,
    ...rest
  } = details;
  const { org, paidInvoices } = rest;
  return {
    ...rest,
    paidInvoices: formatInvoices(paidInvoices),
    ...(org ? { org: formatOrgData(org) } : {}),
  };
}

function formatCash(num: number) {
  return Number(Number(num).toFixed(2)).toLocaleString();
}

const formats = {
  formatInvoices,
  formatInvoicePayment,
  formatOrgData,
  formatTransactionDetails,
  formatCash,
};

export default formats;

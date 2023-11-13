import { Invoice } from "../../../types";

export default function getInvoiceBalance(invoice: Invoice, paymentId: string) {
  const { paymentsReceived, balance } = invoice;
  const payment = paymentsReceived[paymentId] || 0;

  return balance + payment;
}

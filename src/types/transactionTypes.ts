// import { OneOfType } from ".";

export interface CustomerOpeningBalanceTransactionType {
  customer_opening_balance: {
    name: "Customer Opening Balance";
    value: "customer_opening_balance";
  };
}
export interface InvoiceTransactionTypes
  extends CustomerOpeningBalanceTransactionType {
  invoice: {
    name: "Invoice";
    value: "invoice";
  };
}

export interface SaleTransactionTypes extends InvoiceTransactionTypes {
  sale_receipt: {
    name: "Sales Receipt";
    value: "sale_receipt";
  };
  booking: {
    name: "Booking";
    value: "booking";
  };
}

export interface TransactionTypes extends SaleTransactionTypes {
  invoice_payment: {
    name: "Invoice Payment";
    value: "invoice_payment";
  };
  booking_payment: {
    name: "Booking Payment";
    value: "booking_payment";
  };
  opening_balance: {
    name: "Opening Balance";
    value: "opening_balance";
  };
  customer_payment: {
    name: "Customer Payment";
    value: "customer_payment";
  };

  expense: {
    name: "Expense";
    value: "expense";
  };

  journal: {
    name: "Journal";
    value: "journal";
  };
}

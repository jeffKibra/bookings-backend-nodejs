// import { OneOfType } from ".";

export interface CustomerOpeningBalanceTransactionType {
  customer_opening_balance: {
    name: 'Customer Opening Balance';
    value: 'customer_opening_balance';
  };
}
export interface InvoiceTransactionTypes
  extends CustomerOpeningBalanceTransactionType {
  invoice: {
    name: 'Invoice';
    value: 'invoice';
  };
}

export interface SaleTransactionTypes extends InvoiceTransactionTypes {
  sale_receipt: {
    name: 'Sales Receipt';
    value: 'sale_receipt';
  };
  booking: {
    name: 'Booking';
    value: 'booking';
  };
}

export interface PaymentTransactionTypes {
  invoice_payment: {
    name: 'Invoice Payment';
    value: 'invoice_payment';
  };

  invoice_down_payment: {
    name: 'Invoice Down Payment';
    value: 'invoice_down_payment';
  };

  customer_payment: {
    name: 'Customer Payment';
    value: 'customer_payment';
  };
}

export interface TransactionTypes
  extends SaleTransactionTypes,
    PaymentTransactionTypes {
  opening_balance: {
    name: 'Opening Balance';
    value: 'opening_balance';
  };

  expense: {
    name: 'Expense';
    value: 'expense';
  };

  journal: {
    name: 'Journal';
    value: 'journal';
  };
}

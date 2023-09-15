interface Accounts {
  [key: string]: number;
}

interface CashFlow {
  incoming: number;
  outgoing: number;
}

interface PaymentModes {
  [key: string]: number;
}

export interface DailySummary {
  accounts: Accounts;
  cashFlow: CashFlow;
  customers: number;
  deletedInvoices: number;
  deletedPayments: number;
  expenses: number;
  invoices: number;
  invoicesTotal: number;
  items: number;
  payments: number;
  paymentsTotal: number;
  saleReceipts: number;
  vendors: number;
  paymentModes: PaymentModes;
}

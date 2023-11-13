import {
  Tax,
  InvoiceTransactionTypes,
  IContactSummary,
  PaymentTerm,
  // ItemFormData,
} from '.';

export interface ISaleTax extends Tax {
  totalTax: number;
}

export interface ISaleSummary {
  bookingTotal: number;
  total: number;
  // taxType: string;
  // totalTax: number;
  // taxes: SaleTax[];
}

export interface ISaleItem {
  name: string;
  description: string;
  rate: number;
  qty: number;
  total: number;
  details: Record<string, unknown>;
}

export interface ISaleMeta {
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

export interface ISaleForm {
  customer: IContactSummary | null;
  items: ISaleItem[];
  saleDate: Date | string;
  //
  taxType?: 'inclusive' | 'exclusive';
  discount?: number;
  taxes?: string[];
  totalTax?: number;
  subTotal: number;
  total: number;
}

// export interface SelectedItem extends ItemFormData {
//   itemId: string;
// }

// export interface GroupedItems {
//   accountId: string;
//   items: SaleItem[];
// }

export interface ISaleAccountSummary {
  accountId: string;
  saleAmount: number;
}

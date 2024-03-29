import {
  ITax,
  InvoiceTransactionTypes,
  SaleTransactionTypes,
  IContactSummary,
  PaymentTerm,
  IAccountSummary,
  IVehicleForBooking,
  // ItemFormData,
} from '.';

export interface ISaleTax extends ITax {
  totalTax: number;
}

export interface ISaleSummary {
  bookingTotal: number;
  total: number;
  // taxType: string;
  // totalTax: number;
  // taxes: SaleTax[];
}

interface ISaleItemDetails {
  [x: string]: unknown;
  taxType: 'inclusive' | 'exclusive';
  item?: IVehicleForBooking;
  selectedDates?: string[];
  startDate?: Date | string;
  endDate?: Date | string;
}
export interface ISaleItem {
  itemId: string;
  name: string;
  description: string;
  rate: number;
  qty: number;
  subTotal: number;
  tax: number;
  total: number;
  unit?: string;
  //
  // salesAccount: IAccountSummary;
  salesAccountId: string;
  details?: ISaleItemDetails;
  // vehicle?: IVehicleForBooking;
}

export interface ISaleMeta {
  transactionType: keyof SaleTransactionTypes;
  // balance: number;
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

export type ISaleType = 'car_booking' | 'normal';

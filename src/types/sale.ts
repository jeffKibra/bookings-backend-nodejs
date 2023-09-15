import {
  Tax,
  ItemFormData,
  // PaymentTerm,
} from ".";

export interface SaleTax extends Tax {
  totalTax: number;
}

export interface SaleSummary {
  bookingTotal: number;
  total: number;
  // taxType: string;
  // totalTax: number;
  // taxes: SaleTax[];
}

export interface SelectedItem extends ItemFormData {
  itemId: string;
}

// export interface GroupedItems {
//   accountId: string;
//   items: SaleItem[];
// }

export interface SaleAccountSummary {
  accountId: string;
  saleAmount: number;
}

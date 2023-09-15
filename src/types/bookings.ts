import { Timestamp } from "firebase-admin/firestore";
//
import { IContactSummary, Item, PaymentMode } from ".";

export type IBookingDateRange = [string, string];

export interface IBookingAdjustmentData {
  itemId: string;
  booking: IBookingDateRange | null;
}

export type IMonthlyBookings = Record<string, Record<string, string>>;

//eslint-disable-next-line
export interface IBookingItem
  extends Pick<
    Item,
    "name" | "itemId" | "salesAccount" | "rate" | "sku" | "type" | "unit"
  > {}

export interface IBookingDownPayment {
  paymentMode: PaymentMode;
  reference: string;
  amount: number;
}

export interface IBookingForm {
  customer: IContactSummary;
  item: IBookingItem;
  customerNotes: string;
  startDate: Date | string;
  endDate: Date | string;
  // dateRange: IBookingDateRange;
  quantity: number;
  saleDate: Date;
  bookingRate: number;
  bookingTotal: number;
  transferAmount: number;
  total: number;
  downPayment: IBookingDownPayment;
  // transactionType: keyof SaleTransactionTypes;
  // paymentTerm: PaymentTerm;
  // preTaxBookingRate: number;
  // preTaxBookingTotal: number;
  // itemTax: number;
  // itemTaxTotal: number;
  // saleTax?: Tax;
}

export interface IBookingPayments {
  [key: string]: number;
}

interface Meta {
  transactionType: "booking";
  balance: number;
  isSent: boolean;
  isOverdue: boolean;
  overdueAt?: Timestamp;
  paymentsCount: number;
  paymentsIds: string[];
  paymentsReceived: IBookingPayments;
  status: number;
  orgId: string;
  createdAt: Date | Timestamp;
  createdBy: string;
  modifiedAt: Date | Timestamp;
  modifiedBy: string;
}

export interface IBookingFromDb extends IBookingForm, Meta {}

export interface IBooking extends IBookingFromDb {
  id: string;
}

export interface IMonthlyBookingUpdateData {
  datesToCreate: string[];
  datesToDelete: string[];
  unchangedDates: string[];
}

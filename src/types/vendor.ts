import { Timestamp } from "firebase-admin/firestore";
import { PaymentTerm } from ".";

export interface VendorSummary {
  displayName: string;
  companyName: string;
  email: string;
  vendorId: string;
}

interface Meta {
  createdAt: Timestamp | Date;
  createdBy: string;
  modifiedAt: Timestamp | Date;
  modifiedBy: string;
  status: number;
  // summary: {
  //   bills: number;
  //   deletedBills: number;
  //   deletedExpenses: number;
  //   deletedPayments: number;
  //   expenses: number;
  //   payments: number;
  //   totalBills: number;
  //   totalExpenses: number;
  //   totalPayments: number;
  //   unusedCredits: number;
  // };
}

export interface VendorFormData {
  billingCity: string;
  billingCountry: string;
  billingPostalCode: string;
  billingState: string;
  billingStreet: string;
  companyName: string;
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  paymentTerm: PaymentTerm;
  phone: string;
  remarks: string;
  salutation: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
  shippingState: string;
  shippingStreet: string;
  website: string;
}

export interface VendorFromDb extends VendorFormData, Meta {
    contactType:"customer"|"vendor";
}

export interface Vendor extends VendorFromDb {
  vendorId: string;
}

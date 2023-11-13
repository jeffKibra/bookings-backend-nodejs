import { FieldValue } from 'firebase-admin/firestore';
import { PaymentTerm } from '.';

export interface IAddress {
  city: string;
  country: string;
  postalCode: string;
  state: string;
  street: string;
}

export interface IContactForm {
  contactType: 'customer' | 'vendor';
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
  billingAddress: IAddress;
  shippingAddress: IAddress;
  type: 'individual' | 'company';
  website: string;
  openingBalance: number;
}

interface IMeta {
  orgId: string;
  status: number;
  createdAt: Date | FieldValue;
  createdBy: string;
  modifiedAt: Date | FieldValue;
  modifiedBy: string;
}

export interface IContactFromDb
  extends Omit<IContactForm, 'openingBalance'>,
    IMeta {
  openingBalance: {
    amount: number;
    transactionId: string;
  };
  contactType: 'customer' | 'vendor';
}

export interface IContact extends IContactFromDb {
  _id: string;
}

//eslint-disable-next-line
export interface IContactSummary
  extends Pick<IContact, 'displayName' | '_id'> {}

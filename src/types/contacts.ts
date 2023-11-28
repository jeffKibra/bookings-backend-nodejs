import { FieldValue } from 'firebase-admin/firestore';
import { PaymentTerm, IAddress, ISearchQueryOptions } from '.';

export type IContactGroup = 'customer' | 'vendor';

export interface IContactForm {
  type: 'individual' | 'company';
  companyName: string;
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  remarks: string;
  salutation: string;
  billingAddress: IAddress;
  shippingAddress: IAddress;
  paymentTerm: PaymentTerm;
  website: string;
  openingBalance: number;
}

interface IMeta {
  group: IContactGroup;
  orgId: string;
  status: number;
  createdAt: Date | FieldValue;
  createdBy: string;
  modifiedAt: Date | FieldValue;
  modifiedBy: string;
}

export interface IContactFromDb extends IContactForm {
  // openingBalance: {
  //   amount: number;
  //   transactionId: string;
  // };
  metaData: IMeta;
  _id: string;
}

export interface IContact extends IContactFromDb {
  _id: string;
}

//eslint-disable-next-line
export interface IContactSummary
  extends Pick<IContact, 'displayName' | '_id'> {}

export interface ISearchContactsQueryOptions extends ISearchQueryOptions {
  group: IContactGroup;
}

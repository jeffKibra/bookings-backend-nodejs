import { Timestamp } from "firebase-admin/firestore";

export interface TaxForm {
  name: string;
  rate: number;
}

interface Meta {
  createdAt: Timestamp | Date;
  createdBy: string;
  modifiedAt: Timestamp | Date;
  modifiedBy: string;
}

export interface TaxFromDb extends TaxForm, Meta {}

export interface Tax extends TaxFromDb {
  taxId: string;
}

//eslint-disable-next-line
export interface TaxSummary
  extends Omit<Tax, 'createdAt' | 'createdBy' | 'modifiedAt' | 'modifiedBy'> {}

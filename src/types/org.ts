import { Timestamp } from "firebase-admin/firestore";

export interface OrgSummary {
  orgId?: string;
  name?: string;
  businessType?: {
    name?: string;
    value?: string;
  };
}

interface Meta {
  createdAt: Timestamp | Date;
  createdBy: string;
  modifiedBy: string;
  modifiedAt: Timestamp | Date;
  status: number;
}

export interface OrgFormData {
  name: string;
  businessType: {
    name: string;
    value: string;
  };
  city: string;
  country: string;
  industry: string;
  phone: string;
  postalCode: string;
  state: string;
  street: string;
  website: string;
}

export interface OrgFromDb extends OrgFormData, Meta {}

export interface Org extends OrgFromDb {
  orgId: string;
}

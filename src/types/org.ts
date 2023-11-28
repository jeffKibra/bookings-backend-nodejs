import { IAddress } from './address';
import { ITax } from './tax';
import { PaymentMode } from 'paymentMode';
import { PaymentTerm } from './paymentTerm';
export interface IOrgSummary {
  orgId?: string;
  name?: string;
  businessType?: {
    name?: string;
    value?: string;
  };
}

interface IOrgMeta {
  createdAt: Date | string;
  createdBy: string;
  modifiedBy: string;
  modifiedAt: Date | string;
  status: number;
}

export interface IOrgForm {
  name: string;
  businessType: {
    name: string;
    value: string;
  };
  address: IAddress;
  industry: string;
  phone: string;
  website: string;
}

export interface IOrg extends IOrgForm {
  _id: string;
  taxes?: ITax[];
  paymentModes: PaymentMode[];
  paymentTerms: PaymentTerm[];
  metaData: IOrgMeta;
}

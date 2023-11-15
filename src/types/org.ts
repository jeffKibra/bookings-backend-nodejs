import { IAddress } from './address';
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
  metaData: IOrgMeta;
}

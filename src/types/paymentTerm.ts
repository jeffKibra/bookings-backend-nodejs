interface MetaData {
  status: 0 | -1;
  createdBy: string;
  createdAt: Date | string;
  modifiedBy: string;
  modifiedAt: Date | string;
}

export interface IPaymentTermForm {
  name: string;
  days: number;
  value?: string;
}

export interface PaymentTerm extends IPaymentTermForm {
  _id: string;
  metaData: MetaData;
}

export interface IPaymentTermSummary
  extends Pick<PaymentTerm, '_id' | 'name' | 'days'> {}

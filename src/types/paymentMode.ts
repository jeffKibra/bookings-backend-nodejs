interface IMetaData {
  status: 0 | -1;
  createdBy: string;
  createdAt: Date | string;
  modifiedBy: string;
  modifiedAt: Date | string;
}

export interface IPaymentModeForm {
  name: string;
  value?: string;
}

export interface PaymentMode extends IPaymentModeForm {
  _id: string;
  metaData: IMetaData;
}

export interface IPaymentModeSummary
  extends Pick<PaymentMode, '_id' | 'name'> {}

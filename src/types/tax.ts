export interface ITaxForm {
  name: string;
  rate: number;
}

interface ITaxMeta {
  createdAt: Date | string;
  createdBy: string;
  modifiedAt: Date | string;
  modifiedBy: string;
  status: 0;
}

export interface ITax extends ITaxForm {
  _id: string;
  metaData: ITaxMeta;
}

//eslint-disable-next-line
export interface ITaxSummary extends Omit<ITax, 'metaData'> {}

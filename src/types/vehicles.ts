// import { Account } from '.';

// export type IVehicleType = 'Ivehicle' | 'opening_balance';

export interface IVehicleFormData {
  registration: string;
  rate: number;
  sku: string;
  make: string;
  model: string;
  type: string;
  year: number;
  description: string;
  // salesAccount: Account;
  // type: IVehicleType;
  // saleTax?: Tax;
  // saleTaxType?: string;
}

export interface IVehicleSummary extends IVehicleFormData {
  _id: string;
}
interface Meta {
  availableDates: Record<string, Record<string, string[]>>;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
  unit: 'days';
  orgId: string;
  status: string;
}

export interface IVehicleFromDb extends IVehicleFormData {
  metaData: Meta;
}

export interface IVehicle extends IVehicleFromDb {
  _id: string;
}

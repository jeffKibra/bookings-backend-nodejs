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

export type IVehicleSummary = IVehicleFormData;
interface Meta {
  availableDates: Record<string, Record<string, string[]>>;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
  unit: 'days';
}

export interface IVehicleFromDb extends IVehicleFormData {
  orgId: string;
  status: string;
  metaData: Meta;
}

export interface IVehicle extends IVehicleFromDb {
  id: string;
}

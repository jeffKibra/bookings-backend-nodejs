import { IPaginationParams } from './pagination';
import { ISearchQueryOptions } from './search';
import { IVehicleModelSummary } from './vehicleModel';

// export type IVehicleType = 'Ivehicle' | 'opening_balance';

export interface IVehicleFormData {
  registration: string;
  rate: number;
  // sku: string;
  make: string;
  color: string;
  model: IVehicleModelSummary;
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
  status: number;
}

export interface IVehicleFromDb extends IVehicleFormData {
  metaData: Meta;
}

export interface IVehicle extends IVehicleFromDb {
  _id: string;
}

export interface IVehicleForBooking
  extends Pick<
    IVehicle,
    '_id' | 'registration' | 'rate' | 'color' | 'make' | 'model' | 'year'
  > {}

export interface IPaginationLastDoc {
  _id: string;
  searchScore: number;
}
export interface ISearchVehiclesPagination {
  currentPage: number;
  lastDoc: IPaginationLastDoc;
  limit: number;
}

export interface ISearchVehiclesQueryOptions extends ISearchQueryOptions {
  bookingId?: string;
  selectedDates?: string[];
}

import { ObjectId } from 'mongodb';

// export type IVehicleType = 'Ivehicle' | 'opening_balance';

interface IMeta {
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
  orgId: string;
  status: number;
}

export interface IVehicleModelForm {
  name: string;
  make: string;
  type: string;
  years: string;
}

// export interface IVehicleSummary extends IVehicleFormData {
//   _id: string;
// }

export interface IVehicleModelFromDb extends IVehicleModelForm {
  _id: ObjectId;
  metaData: IMeta;
}

export interface IVehicleModel extends Omit<IVehicleModelFromDb, '_id'> {
  _id: string;
}

export interface IVehicleModelFromFile
  extends Pick<IVehicleModel, 'make' | 'type'> {
  model: string;
  years: string[];
}

export interface IVehicleModelSummary
  extends Pick<IVehicleModel, 'make' | 'name' | 'type'> {
  year: number;
}

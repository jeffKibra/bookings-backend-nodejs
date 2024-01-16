import { ObjectId } from 'mongodb';
import { IVehicleModel } from './vehicleModel';

// export type IVehicleType = 'Ivehicle' | 'opening_balance';

interface IMeta {
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
  orgId: string;
  status: number;
}

export interface IVehicleMakeForm {
  name: string;
}

// export interface IVehicleSummary extends IVehicleFormData {
//   _id: string;
// }

export interface IVehicleMake extends IVehicleMakeForm {
  _id: string;
  models: IVehicleModel[];
  metaData: IMeta;
}

export interface IVehicleMakeDBModel
  extends Omit<IVehicleMake, '_id' | 'models'> {
  models: Omit<IVehicleModel, '_id'>[];
}

export interface IVehicleMakeSummary extends Omit<IVehicleMake, 'models'> {}

// export interface IVehicleMakeFromDb extends IVehicleMakeForm {
//   _id: ObjectId;

// }

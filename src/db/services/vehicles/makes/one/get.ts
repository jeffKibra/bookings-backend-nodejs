import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../models';
import { ICustomThis } from './models/create';

import { IVehicleMake } from '../../../../../types';

export default async function get(this: ICustomThis) {
  const { makeId } = this;

  const result = await VehicleMakeModel.findById(makeId).exec();
  console.log('get vehicle make result', result);

  let makeData: IVehicleMake | null = null;

  if (result) {
    makeData = result.toJSON();
  }

  return makeData;
}

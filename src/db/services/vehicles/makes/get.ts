import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../models';

import { IVehicleMake } from '../../../../types';

export default async function get(name: string) {
  const result = await VehicleMakeModel.findOne({
    name,
  }).exec();
  console.log('get vehicle make result', result);

  let makeData: IVehicleMake | null = null;

  if (result) {
    makeData = result.toJSON();
  }

  return makeData;
}

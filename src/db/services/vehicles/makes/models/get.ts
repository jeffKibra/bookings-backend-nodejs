import { ObjectId } from 'mongodb';

import { ICustomThis } from './create';

import { VehicleMakeModel } from '../../../../models';

import { IVehicleModel } from '../../../../../types';

export default async function get(
  this: ICustomThis,
  id: string,
  filterByOrg = false
) {
  const { make, orgId } = this;

  const modelId = new ObjectId(id);

  const result = await VehicleMakeModel.aggregate<IVehicleModel>([
    {
      $match: {
        name: make,
        'models._id': modelId,
      },
    },
    {
      $unwind: '$models',
    },
    {
      $match: {
        'models._id': modelId,
        'models.metaData.status': 0,
        ...(filterByOrg ? { 'models.metaData.orgId': orgId } : {}),
      },
    },
    {
      $replaceRoot: {
        newRoot: '$models',
      },
    },
  ]);

  const modelData = result[0];

  console.log('model data', modelData);

  return modelData;
}

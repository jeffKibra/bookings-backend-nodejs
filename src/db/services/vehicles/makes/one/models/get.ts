import { ObjectId } from 'mongodb';

import { ICustomThis } from './create';

import { VehicleMakeModel } from '../../../../../models';

import { IVehicleModel } from '../../../../../../types';

export default async function get(this: ICustomThis, id: string) {
  const { makeId, orgId } = this;

  const modelId = new ObjectId(id);

  const result = await VehicleMakeModel.aggregate<IVehicleModel>([
    {
      $match: {
        _id: new ObjectId(makeId),
        'models._id': modelId,
      },
    },
    {
      $unwind: '$models',
    },
    {
      $match: {
        'models._id': modelId,
        'metaData.status': 0,
        // 'metaData.orgId': { $or: ['all', orgId] },
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

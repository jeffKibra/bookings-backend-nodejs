import { VehicleMakeModel } from '../../../models';

import { IVehicleMake } from '../../../../types';

export default async function getList() {
  return VehicleMakeModel.aggregate<IVehicleMake>([
    {
      $match: {
        'metaData.status': 0,
      },
    },
    {
      $project: {
        name: 1,
        _id: {
          $toString: '$_id',
        },
      },
    },
  ]);
}

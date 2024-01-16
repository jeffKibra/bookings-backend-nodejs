import { VehicleMakeModel } from '../../../models';

export default async function getList(orgId: string) {
  return VehicleMakeModel.aggregate([
    {
      $match: {
        'metaData.status': 0,
        'metaData.orgId': { $or: ['all', orgId] },
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

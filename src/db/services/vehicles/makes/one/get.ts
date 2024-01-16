import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../models';

export default async function get() {
  return VehicleMakeModel.findOne({
    _id: new ObjectId(),
    'metaData.status': 0,
    // 'metaData.orgId': { $or: ['all', orgId] },
  });
}

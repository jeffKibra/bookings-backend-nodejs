import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../../models';

export default async function get(id: string) {
  const makeData = await VehicleMakeModel.findOne({
    _id: new ObjectId(),
    'metaData.status': 0,
    // 'metaData.orgId': { $or: ['all', orgId] },
  }).exec();

  console.log('make data', makeData);
}

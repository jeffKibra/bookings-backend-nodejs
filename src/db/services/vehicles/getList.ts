import { VehicleModel } from '../../models';
//

export async function getList(orgId: string) {
  if (!orgId) {
    throw new Error('Invalid Params: orgId is required!');
  }

  const vehicles = await VehicleModel.find({
    'metaData.orgId': orgId,
    'metaData.status': { $gte: 0 },
  });

  // console.log({ vehicles });

  return vehicles;
}

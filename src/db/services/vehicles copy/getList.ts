import { VehicleModel } from '../../models';
//

//
import { IVehicle } from '../../../types';
//

export async function getList(orgId: string) {
  if (!orgId) {
    throw new Error('Invalid Params: orgId is required!');
  }

  const vehicles = await VehicleModel.find({
    'metaData.orgId': orgId,
  });

  // console.log({ vehicles });

  return vehicles;
}

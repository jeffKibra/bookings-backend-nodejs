import { ObjectId } from 'mongodb';
//
import { VehicleModel } from '../../models';
//
import { createSKU } from '../../../utils';

export function getByRegistration(orgId: string, vehicleRegistration: string) {
  if (!vehicleRegistration || !orgId) {
    throw new Error(
      'Invalid Params: Errors in params [orgId|vehicleRegistration]!'
    );
  }

  const sku = createSKU(vehicleRegistration);
  // console.log({ sku });

  return getBySKU(orgId, sku);
}

export async function getBySKU(orgId: string, sku: string) {
  if (!sku || !orgId) {
    throw new Error('Invalid Params: Errors in params [orgId|sku]!');
  }

  const vehicle = await VehicleModel.findOne({
    'metaData.orgId': orgId,
    sku,
    status: { $gte: 0 },
  });

  // console.log({ vehicle });

  return vehicle;
}

export async function getById(orgId: string, vehicleId: string) {
  if (!vehicleId || !orgId) {
    throw new Error('Invalid Params: Errors in params [orgId|vehicleId]!');
  }

  // console.log('fetching vehicle for id ' + vehicleId);

  return VehicleModel.findOne({
    _id: new ObjectId(vehicleId),
    'metaData.orgId': orgId,
    status: { $gte: 0 },
  });
}

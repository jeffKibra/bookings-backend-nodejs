import { ObjectId } from 'mongodb';
//
import { getBySKU } from './getVehicle';
//
import { VehicleModel } from '../../models';
//
import { IVehicleFormData } from '../../../types';
import { createSKU } from '../../../utils';

export default async function updateVehicle(
  userUID: string,
  orgId: string,
  vehicleId: string,
  formData: IVehicleFormData
) {
  if (!userUID || !orgId || !vehicleId) {
    throw new Error(
      'Missing Params: Either userUID or orgId or vehicleId is missing!'
    );
  }
  //confirm registration is unique

  const reg = formData?.registration;
  const sku = createSKU(reg);
  console.log({ reg, sku, orgId, userUID });

  const similarVehicle = await getBySKU(orgId, sku);
  console.log({ similarVehicle });

  const isSameVehicle = similarVehicle?.id === vehicleId;
  console.log({ isSameVehicle, vehicleId });

  if (!isSameVehicle) {
    throw new Error(
      'Unique Registration: There is another vehile with similar registration! '
    );
  }

  const updatedVehicle = await VehicleModel.findOneAndUpdate(
    { id: new ObjectId() },
    {
      $set: {
        ...formData,
        'metaData.modifiedAt': Date.now(),
        'metaData.modifiedBy': userUID,
      },
    }
  );
  console.log({ updateVehicle });

  return updatedVehicle;
}

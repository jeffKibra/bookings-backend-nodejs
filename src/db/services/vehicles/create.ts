import { VehicleModel } from '../../models';
//
import { getBySKU } from './getVehicle';
//
import { IVehicleFormData } from '../../../types';
import { createSKU } from '../../../utils';

export default async function createVehicle(
  userUID: string,
  orgId: string,
  formData: IVehicleFormData
) {
  if (!userUID || !orgId || !formData) {
    throw new Error('Missing Params: Either userUID or orgId or formData is missing!');
  }

  const reg = formData?.registration;
  const sku = createSKU(reg);
  console.log({ reg, sku, orgId, userUID });

  const similarVehicle = await getBySKU(orgId, sku);
  console.log({ similarVehicle });

  if (similarVehicle) {
    throw new Error(
      'Unique Registration: There is another vehile with similar registration! '
    );
  }

  const instance = new VehicleModel({
    ...formData,
    orgId,
    status: 0,
    sku,
    metaData: {
      orgId,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      createdBy: userUID,
      modifiedBy: userUID,
    },
  });

  const savedDoc = await instance.save();
  console.log({ savedDoc });
}

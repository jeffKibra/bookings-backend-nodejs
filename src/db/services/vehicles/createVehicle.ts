import { VehicleModel } from '../../models';
//
import { IVehicleFormData } from '../../../types';
import { createSKU } from '../../../utils';

export default async function createVehicle(
  userUID: string,
  orgId: string,
  formData: IVehicleFormData
) {
  if (!userUID || !orgId) {
    throw new Error('Missing Params: Either userUID or orgId is missing!');
  }

  const reg = formData?.registration;
  const sku = createSKU(reg);
  console.log({ reg, sku, orgId, userUID });

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

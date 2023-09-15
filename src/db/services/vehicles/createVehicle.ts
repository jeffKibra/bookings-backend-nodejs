import { VehicleModel } from '../../models';
//
import { IVehicleFormData } from '../../../types';
import { createSKU } from '../../../utils';

export default async function createVehicle(
  userUID: string,
  orgId: string,
  formData: IVehicleFormData
) {
  const reg = formData?.registration;
  const sku = createSKU(reg);
  console.log({ reg, sku });

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

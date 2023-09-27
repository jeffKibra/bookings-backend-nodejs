import { ObjectId } from 'mongodb';
//
import { getBySKU } from './getOne';
//
import { VehicleModel } from '../../models';
//
import { IVehicleFormData } from '../../../types';
import { createSKU } from '../../../utils';
import { handleDBError } from '../utils';

export default async function updatedVehicle(
  userUID: string,
  orgId: string,
  vehicleId: string,
  formData: IVehicleFormData
) {
  if (!userUID || !orgId || !vehicleId || !formData) {
    throw new Error(
      'Missing Params: Either userUID or orgId or vehicleId or formData is missing!'
    );
  }
  //confirm registration is unique

  try {
    const reg = formData?.registration;
    const sku = createSKU(reg);
    // console.log({ reg, sku, orgId, userUID });

    // const similarVehicle = await getBySKU(orgId, sku);
    // // console.log({ similarVehicle });

    // const similarVehicleId = similarVehicle?._id?.toString();
    // const isSameVehicle = similarVehicleId === vehicleId;
    // // console.log({ isSameVehicle, vehicleId, similarVehicleId });

    // if (!isSameVehicle) {
    //   throw new Error(
    //     'Unique Registration: There is another vehile with similar registration! '
    //   );
    // }

    const updatedVehicle = await VehicleModel.findOneAndUpdate(
      { _id: new ObjectId(vehicleId) },
      {
        $set: {
          ...formData,
          sku,
          'metaData.modifiedAt': new Date(),
          'metaData.modifiedBy': userUID,
        },
      },
      { new: true }
    );
    // console.log('updated vehicle', updatedVehicle);

    return updatedVehicle;
  } catch (error) {
    console.log({ error });

    handleDBError(error, 'Error Updating Vehicle.');
  }
}

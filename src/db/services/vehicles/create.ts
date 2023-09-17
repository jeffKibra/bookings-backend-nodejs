import { VehicleModel } from '../../models';
//
import { getBySKU } from './getOne';
import { handleDBError } from '../utils';
//
import { IVehicleFormData } from '../../../types';
import { createSKU } from '../../../utils';

export default async function createVehicle(
  userUID: string,
  orgId: string,
  formData: IVehicleFormData
) {
  if (!userUID || !orgId || !formData) {
    throw new Error(
      'Missing Params: Either userUID or orgId or formData is missing!'
    );
  }

  try {
    const reg = formData?.registration;
    const sku = createSKU(reg);
    console.log({ reg, sku, orgId, userUID });

    // const similarVehicle = await getBySKU(orgId, sku);
    // console.log({ similarVehicle });

    // if (similarVehicle) {
    //   throw new Error(
    //     'Unique Registration: There is another vehile with similar registration! '
    //   );
    // }

    // console.log('starting model init...');
    // const initResult = await VehicleModel.init();
    // console.log('finished initializing model...', initResult);

    const instance = new VehicleModel({
      ...formData,
      orgId,
      sku,
      metaData: {
        orgId,
        status: 0,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        createdBy: userUID,
        modifiedBy: userUID,
      },
    });

    const savedDoc = await instance.save();
    console.log({ savedDoc });
  } catch (error) {
    console.log('create vehicle', error);

    handleDBError(error, 'Error Creating Vehicle');
  }
}

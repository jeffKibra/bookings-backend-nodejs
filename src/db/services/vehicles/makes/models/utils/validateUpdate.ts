import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../../models';
import { IVehicleModel, IVehicleModelForm } from '../../../../../../types';
//
import getModel from '../get';

export default async function validateUpdate(
  orgId: string,
  id: string,
  formData: IVehicleModelForm
) {
  const { make } = formData;
  // console.log('validating model update', { orgId, make, id });

  const modelData = await getModel.call({ make, orgId }, id, true);

  const editingAllowed = Boolean(modelData);

  // console.log({ editingAllowed });

  if (!editingAllowed) {
    throw new Error(
      'Action not allowed! You are allowed to edit only the models you created! '
    );
  }

  return modelData;
}

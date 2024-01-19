import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../models';

import { checkModelName, validateUpdate } from './utils';

import { IVehicleModelForm, IVehicleMake } from '../../../../../types';
import { ICustomThis } from './create';

export default async function update(
  this: ICustomThis,
  userUID: string,
  id: string,
  formData: IVehicleModelForm
) {
  const { make, orgId } = this;

  console.log({ modelId: id, make });
  const { name: modelName, type, years } = formData;

  await Promise.all([
    checkModelName(make, modelName, id),
    validateUpdate(orgId, id, formData),
  ]);

  const result = await VehicleMakeModel.findOneAndUpdate(
    {
      name: make,
      models: {
        $elemMatch: {
          _id: new ObjectId(id),
          'metaData.status': 0,
          'metaData.orgId': orgId,
        },
      },
    },
    {
      $set: {
        //make fields
        'metaData.modifiedBy': userUID,
        'metaData.modifiedAt': new Date(),
        //model fields-never change make field
        'models.$.name': modelName,
        'models.$.type': type,
        'models.$.years': years,
        'models.$.metaData.modifiedAt': new Date(),
        'models.$.metaData.modifiedBy': userUID,
      },
    },
    {
      new: true,
    }
  );

  console.log('update model result', result);

  let makeData: IVehicleMake | null = null;
  if (result) {
    makeData = result.toJSON();
  }

  return makeData;
}

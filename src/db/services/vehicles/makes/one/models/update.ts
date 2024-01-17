import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../../models';

import { checkModelName } from './utils';

import { IVehicleModelForm, IVehicleMake } from '../../../../../../types';
import { ICustomThis } from './create';

export default async function update(
  this: ICustomThis,
  userUID: string,
  id: string,
  formData: IVehicleModelForm
) {
  const { makeId, orgId } = this;

  console.log({ modelId: id, makeId });
  const { name: modelName, type, years } = formData;

  await checkModelName(makeId, modelName, id);

  const result = await VehicleMakeModel.findOneAndUpdate(
    {
      _id: new ObjectId(makeId),
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
        'metaData.modifiedAt': userUID,
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
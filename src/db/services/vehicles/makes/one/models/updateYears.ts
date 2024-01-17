import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../../models';

import { checkModelName } from './utils';

import { IVehicleModelForm, IVehicleModel } from '../../../../../../types';
import { ICustomThis } from './create';

export default async function update(
  this: ICustomThis,
  userUID: string,
  id: string,
  years: string
) {
  const { makeId, orgId } = this;

  const result = await VehicleMakeModel.findOneAndUpdate(
    {
      _id: new ObjectId(makeId),
      'models._id': new ObjectId(id),
      'metaData.status': 0,
      'metaData.orgId': orgId,
    },
    {
      $set: {
        //make fields
        'metaData.modifiedBy': userUID,
        'metaData.modifiedAt': userUID,
        //model fields-never change make field
        'models.$.years': years,
        'models.$.metaData.modifiedAt': new Date(),
        'models.$.metaData.modifiedBy': userUID,
      },
    }
  );

  console.log('update model result', result);

  let modelData: IVehicleModel | null = null;
  if (result) {
    modelData = result.toJSON();
  }

  return modelData;
}

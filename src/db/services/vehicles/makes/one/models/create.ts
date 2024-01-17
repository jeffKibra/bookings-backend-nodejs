import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../../models';

import { checkModelName } from './utils';

//
import { IVehicleModelForm } from '../../../../../../types';

export interface ICustomThis {
  makeId: string;
  orgId: string;
}

export default async function create(
  this: ICustomThis,
  userUID: string,
  formData: IVehicleModelForm
) {
  const { makeId, orgId } = this;
  console.log({ makeId, orgId, userUID });

  await checkModelName(makeId, formData.name);

  const result = await VehicleMakeModel.findOneAndUpdate(
    {
      _id: new ObjectId(makeId),
      'metaData.status': 0,
    },
    {
      $set: {
        'metaData.modifiedBy': userUID,
        'metaData.modifiedAt': new Date(),
      },
      $addToSet: {
        models: {
          ...formData,
          metaData: {
            orgId,
            status: 0,
            createdBy: userUID,
            modifiedBy: userUID,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      },
    }
  );

  // console.log('create model result', result);

  // return result;
}

import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../models';

import { checkModelName } from './utils';

//
import { IVehicleModelForm } from '../../../../../types';

export interface ICustomThis {
  make: string;
  orgId: string;
}

export default async function create(
  this: ICustomThis,
  userUID: string,
  formData: IVehicleModelForm
) {
  const { make, orgId } = this;
  console.log({ make, orgId, userUID });

  await checkModelName(make, formData.name);

  const result = await VehicleMakeModel.findOneAndUpdate(
    {
      name: make,
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

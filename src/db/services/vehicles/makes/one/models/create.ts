import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../../models';
import { IVehicleModelForm } from '../../../../../../types';

export interface ICustomThis {
  makeId: string;
}

const orgId = '';

export default async function create(
  userUID: string,
  modelFormData: IVehicleModelForm
) {
  const result = await VehicleMakeModel.findOneAndUpdate(
    { _id: new ObjectId(), 'metaData.status': 0, 'metaData.orgId': orgId },
    {
      $set: {
        'metaData.modifiedBy': userUID,
        'metaData.modifiedAt': userUID,
      },
      $push: {
        models: {
          ...modelFormData,
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

  return result;
}

import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../../models';

import { IVehicleModelForm } from '../../../../../../types';

const orgId = '';

export default async function update(
  userUID: string,
  id: string,
  formData: IVehicleModelForm
) {
  const result = await VehicleMakeModel.findOneAndUpdate(
    { _id: new ObjectId(), 'metaData.status': 0, 'metaData.orgId': orgId },
    {
      $set: {
        'metaData.modifiedBy': userUID,
        'metaData.modifiedAt': userUID,
      },
      //   $push: {
      //     models: {
      //       ...formData,
      //       metaData: {
      //         orgId,
      //         status: 0,
      //         createdBy: userUID,
      //         modifiedBy: userUID,
      //         createdAt: new Date(),
      //         modifiedAt: new Date(),
      //       },
      //     },
      //   },
    }
  );
}

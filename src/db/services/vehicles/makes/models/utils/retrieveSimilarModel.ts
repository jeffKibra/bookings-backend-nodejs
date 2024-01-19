import { ObjectId } from 'mongodb';

import { VehicleMakeModel } from '../../../../../models';
import { IVehicleModel } from '../../../../../../types';

export default async function retrieveSimilarModel(
  make: string,
  modelName: string,
  modelId: string = ''
) {
  const result = await VehicleMakeModel.aggregate<IVehicleModel>([
    {
      $match: {
        name: make,
        'models.name': modelName,
      },
    },
    {
      $unwind: '$models',
    },
    {
      $match: {
        'models.name': modelName,
        'models.metaData.status': 0,
        ...(modelId
          ? {
              'models._id': {
                $ne: new ObjectId(modelId),
              },
            }
          : {}),
      },
    },
    {
      $replaceRoot: {
        newRoot: '$models',
      },
    },
  ]);

  const modelData = result[0];

  console.log('model data', modelData);

  return modelData;
}

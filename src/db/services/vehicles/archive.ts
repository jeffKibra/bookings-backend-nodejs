import { ObjectId } from 'mongodb';
import { VehicleModel } from '../../models';
//

export default async function archiveVehicle(
  userUID: string,
  orgId: string,
  vehicleId: string
) {
  if (!userUID || !orgId || !vehicleId) {
    throw new Error(
      'Missing Params: Either userUID or orgId or vehicleId is missing!'
    );
  }
  //confirm registration is unique

  const writeResult = await VehicleModel.updateOne(
    { _id: new ObjectId(vehicleId) },
    {
      $set: {
        'metaData.status': -1,
        'metaData.deleted': true,
        'metaData.modifiedAt': new Date(),
        'metaData.modifiedBy': userUID,
      },
    }
  );
  // console.log('delete vehicle result', writeResult);

  return writeResult;
}

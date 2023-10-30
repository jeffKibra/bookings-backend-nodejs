import { ObjectId } from 'mongodb';
import { VehicleModel } from '../../models';
//
// import search from './search';

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
  // console.log('starting to delete');

  // const writeResult = await VehicleModel.findByIdAndUpdate(
  //   vehicleId,
  //   {
  //     $set: {
  //       'metaData.status': -1,
  //       'metaData.modifiedAt': new Date(),
  //       'metaData.modifiedBy': userUID,
  //     },
  //   },
  //   {
  //     new: true,
  //   }
  // );
  const writeResult = await VehicleModel.updateOne(
    { _id: new ObjectId(vehicleId) },
    {
      $set: {
        'metaData.status': -1,
        'metaData.modifiedAt': new Date(),
        'metaData.modifiedBy': userUID,
      },
    }
  );
  // console.log('write result', writeResult);

  // console.log('delete vehicle result', writeResult);

  // console.log('starting to search after deleting');

  // const searchResult = await search(
  //   'o2z3BAi53GDm7cSk480v',
  //   ''
  //   // options?: ISearchVehiclesQueryOptions
  // );

  // console.log('searched vehicles after delete', searchResult?.vehicles);

  return writeResult;
}

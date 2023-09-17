import { ObjectId } from 'mongodb';
//
import { BookingModel } from '../../models';
//

export default async function archiveBooking(
  userUID: string,
  orgId: string,
  bookingId: string
) {
  if (!userUID || !orgId || !bookingId) {
    throw new Error(
      'Missing Params: Either userUID or orgId or bookingId is missing!'
    );
  }
  //confirm registration is unique

  const writeResult = await BookingModel.updateOne(
    { _id: new ObjectId(bookingId) },
    {
      $set: {
        'metaData.status': -1,
        'metaData.modifiedAt': Date.now(),
        'metaData.modifiedBy': userUID,
      },
    }
  );
  // console.log('delete vehicle result', writeResult);

  return writeResult;
}

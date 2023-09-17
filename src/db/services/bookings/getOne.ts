import { ObjectId } from 'mongodb';
//
import { BookingModel } from '../../models';
//

export async function getById(orgId: string, bookingId: string) {
  if (!bookingId || !orgId) {
    throw new Error('Invalid Params: Errors in params [orgId|bookingId]!');
  }

  // console.log('fetching vehicle for id ' + bookingId);

  return BookingModel.findOne({
    _id: new ObjectId(bookingId),
    'metaData.orgId': orgId,
    'metaData.status': { $gte: 0 },
  });
}

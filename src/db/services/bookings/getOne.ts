import { ObjectId } from 'mongodb';
import { ClientSession } from 'mongoose';
//
import { BookingModel } from '../../models';
import { IBooking } from '../../../types';
//

export async function getById(
  orgId: string,
  bookingId: string
): Promise<IBooking | null> {
  if (!bookingId || !orgId) {
    throw new Error('Invalid Params: Errors in params [orgId|bookingId]!');
  }

  // console.log('fetching vehicle for id ' + bookingId);

  return BookingModel.findOne({
    _id: new ObjectId(bookingId),
    'metaData.orgId': orgId,
  });
}

export async function findVehicleBookingWithAtleastOneOfTheSelectedDates(
  orgId: string,
  vehicleId: string,
  selectedDates: string[],
  session?: ClientSession
) {
  const booking = await BookingModel.findOne(
    {
      'vehicle._id': vehicleId,
      'metaData.orgId': orgId,
      selectedDates: { $in: [...selectedDates] },
    },
    {},
    { ...(session ? { session } : {}) }
  );

  console.log({ booking });

  return booking;
}

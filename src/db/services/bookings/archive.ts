import { ObjectId } from 'mongodb';
import { startSession } from 'mongoose';
//
import { BookingModel } from '../../models';
import { handleDBError } from '../utils';
import { updateItemBookings } from '../itemMonthlyBookings/utils';
//
import { getById } from './getOne';
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

  const bookingData = await getById(orgId, bookingId);
  if (!bookingData) {
    throw new Error('Booking not found!');
  }

  const {
    vehicle: { _id: vehicleId },
    selectedDates,
  } = bookingData;

  const session = await startSession();
  session.startTransaction();

  try {
    const writeResult = await BookingModel.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          'metaData.status': -1,
          'metaData.modifiedAt': new Date(),
          'metaData.modifiedBy': userUID,
        },
      },
      { session }
    );
    console.log('delete booking result', writeResult);

    await updateItemBookings(session, orgId, vehicleId, [], selectedDates);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    handleDBError(error, 'Error deleting Booking');
  } finally {
    await session.endSession();
  }
}

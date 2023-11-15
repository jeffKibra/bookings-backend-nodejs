import { ObjectId } from 'mongodb';
import { startSession } from 'mongoose';
//
import { BookingModel } from '../../../models';
import { handleDBError } from '../../utils';
import { Invoice } from '../invoices/utils';
//
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

  const session = await startSession();
  session.startTransaction();

  try {
    const instance = new Invoice(session, {
      invoiceId: bookingId,
      orgId,
      userId: userUID,
      saleType: 'car_booking',
    });

    const writeResult = await instance.delete();

    console.log('delete booking result', writeResult);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    handleDBError(error, 'Error deleting Booking');
  } finally {
    await session.endSession();
  }
}

import { ObjectId } from 'mongodb';
import { startSession } from 'mongoose';
//
import { Bookings, updateBookingDates } from './utils';
//
import { BookingModel } from '../../models';
//
import { IBookingForm } from '../../../types';
//
import { getById } from './getOne';
import { handleDBError } from '../utils';
import { updateItemBookings } from '../itemMonthlyBookings/utils';

export default async function updatedBooking(
  userUID: string,
  orgId: string,
  bookingId: string,
  formData: IBookingForm
) {
  if (!userUID || !orgId || !bookingId || !formData) {
    throw new Error(
      'Missing Params: Either userUID or orgId or bookingId or formData is missing!'
    );
  }

  //fetch current saved data

  const { currentBooking, incomingBooking } = await Bookings.validateUpdate(
    orgId,
    bookingId,
    formData
  );
  const {
    selectedDates: incomingSelectedDates,
    vehicle: { _id: incomingVehicleId },
  } = incomingBooking;
  const {
    selectedDates: currentSelectedDates,
    vehicle: { _id: currentVehicleId },
  } = currentBooking;

  const balanceAdjustment = Bookings.generateBalanceAdjustment(
    incomingBooking,
    currentBooking
  );
  console.log({ balanceAdjustment });

  const session = await startSession();

  session.startTransaction();

  let updatedBooking = null;

  try {
    updatedBooking = await BookingModel.findOneAndUpdate(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          ...formData,
          'metaData.modifiedAt': Date.now(),
          'metaData.modifiedBy': userUID,
        },
        $inc: {
          balance: balanceAdjustment,
        },
      },
      { new: true, session }
    );

    await updateBookingDates(
      session,
      orgId,
      incomingVehicleId,
      currentVehicleId,
      incomingSelectedDates,
      currentSelectedDates
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    handleDBError(error, 'Error Updating Booking');
  } finally {
    await session.endSession();
  }

  //confirm registration is unique

  // console.log('updated vehicle', updatedBooking);

  return updatedBooking;
}

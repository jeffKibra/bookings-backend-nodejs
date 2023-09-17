import { ObjectId } from 'mongodb';
//
import { Bookings } from './utils';
//
import { BookingModel } from '../../models';
//
import { IBookingForm } from '../../../types';
//
import { getById } from './getOne';

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

  const balanceAdjustment = Bookings.generateBalanceAdjustment(
    incomingBooking,
    currentBooking
  );

  console.log({ balanceAdjustment });

  //confirm registration is unique

  const updatedBooking = await BookingModel.findOneAndUpdate(
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
    { new: true }
  );
  // console.log('updated vehicle', updatedBooking);

  return updatedBooking;
}

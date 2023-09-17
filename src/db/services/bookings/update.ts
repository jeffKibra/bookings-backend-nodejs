import { ObjectId } from 'mongodb';
//
//
import { BookingModel } from '../../models';
//
import { IBookingForm } from '../../../types';

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
  //confirm registration is unique

  const updatedBooking = await BookingModel.findOneAndUpdate(
    { _id: new ObjectId(bookingId) },
    {
      $set: {
        ...formData,
        'metaData.modifiedAt': Date.now(),
        'metaData.modifiedBy': userUID,
      },
    },
    { new: true }
  );
  // console.log('updated vehicle', updatedBooking);

  return updatedBooking;
}

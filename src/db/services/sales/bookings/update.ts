import { ObjectId } from 'mongodb';
import { startSession } from 'mongoose';
//
import { Bookings } from './utils';
import { Invoice } from '../invoices/utils';
//
import { BookingModel } from '../../../models';
//
import { IBookingForm, IInvoice } from '../../../../types';
//
import { getById } from './getOne';
import { handleDBError } from '../../utils';

export default async function updateBooking(
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

  const session = await startSession();

  session.startTransaction();

  let updatedBooking: IInvoice | null = null;

  try {
    // const { currentBooking, incomingBooking } = await Bookings.validateUpdate(
    //   orgId,
    //   bookingId,
    //   formData
    // );

    const invoiceForm = Bookings.createInvoiceFormFromBooking(formData);

    const invoiceInstance = new Invoice(session, {
      invoiceId: bookingId,
      orgId,
      userId: userUID,
      saleType: 'car_booking',
    });

    updatedBooking = await invoiceInstance.update(invoiceForm);
    //fetch current saved data

    // const {
    //   selectedDates: incomingSelectedDates,
    //   vehicle: { _id: incomingVehicleId },
    // } = incomingBooking;
    // const {
    //   selectedDates: currentSelectedDates,
    //   vehicle: { _id: currentVehicleId },
    // } = currentBooking;

    // const balanceAdjustment = Bookings.generateBalanceAdjustment(
    //   incomingBooking,
    //   currentBooking
    // );
    // console.log({ balanceAdjustment });

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

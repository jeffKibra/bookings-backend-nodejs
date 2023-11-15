import BigNumber from 'bignumber.js';
import { startSession } from 'mongoose';
import { ObjectId } from 'mongodb';
//
import { formatBookingFormData, Bookings } from './utils';
import { Invoice } from '../invoices/utils';
//
import { handleDBError } from '../../utils';
import { BookingModel } from '../../../models';
//
//
import { IBookingForm } from '../../../../types';

//

export default async function createBooking(
  userUID: string,
  orgId: string,
  formData: IBookingForm
) {
  if (!userUID || !orgId || !formData) {
    throw new Error(
      'Missing Params: Either userUID or orgId or formData is missing!'
    );
  }

  const {
    downPayment: { amount: downPayment },
    total,
  } = formData;

  if (downPayment > total) {
    throw new Error(
      `Failed to create Booking! Imprest given: ${Number(
        downPayment
      ).toLocaleString()} is more than the booking total amount: ${Number(
        total
      ).toLocaleString()}.`
    );
  }

  const balance = new BigNumber(total).minus(downPayment).dp(2).toNumber();

  const formattedFormData = formatBookingFormData(formData);

  const {
    vehicle: { _id: vehicleId },
  } = formData;

  const bookingObjectId = new ObjectId();
  const bookingId = bookingObjectId.toString();
  console.log({ bookingId });

  const session = await startSession();
  session.startTransaction();

  const invoiceId = new ObjectId().toString();

  try {
    await Bookings.validateFormData(orgId, formattedFormData, session);

    const invoiceForm = Bookings.createInvoiceFormFromBooking(formData);

    const invoiceInstance = new Invoice(session, {
      invoiceId,
      orgId,
      userId: userUID,
      saleType: 'car_booking',
    });

    const result = await invoiceInstance.create(invoiceForm);

    console.log('result', result);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    //handle errors
    handleDBError(error, 'Error Saving Booking');
  } finally {
    await session.endSession();
  }
}

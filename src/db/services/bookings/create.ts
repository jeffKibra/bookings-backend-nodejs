import BigNumber from 'bignumber.js';
import { startSession } from 'mongoose';
//
import { formatBookingFormData } from './utils';
//
import { handleDBError } from '../utils';
import { BookingModel } from '../../models';
//
import { utils as itemMonthlyBookingsUtils } from '../itemMonthlyBookings';
//
import { IBookingForm } from '../../../types';

//
const { updateItemBookings } = itemMonthlyBookingsUtils;

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

  const instance = new BookingModel({
    ...formattedFormData,
    balance,
    metaData: {
      orgId,
      status: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
      createdBy: userUID,
      modifiedBy: userUID,
    },
  });

  const selectedDates = formattedFormData.selectedDates;

  const session = await startSession();
  session.startTransaction();
  try {
    //db operations
    // instance.mark
    const savedDoc = await instance.save({ session });
    console.log({ savedDoc });

    await updateItemBookings(session, orgId, vehicleId, selectedDates);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    //handle errors
    handleDBError(error, 'Error Saving Booking');
  } finally {
    await session.endSession();
  }
}

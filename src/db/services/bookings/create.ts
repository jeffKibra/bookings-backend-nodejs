import BigNumber from 'bignumber.js';
//
import { generateBookingFormData } from './utils';
//
import { BookingModel } from '../../models';
//
//
import { IBookingForm } from '../../../types';

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

  const formattedFormData = generateBookingFormData(formData);

  const instance = new BookingModel({
    ...formattedFormData,
    balance,
    metaData: {
      orgId,
      status: 0,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      createdBy: userUID,
      modifiedBy: userUID,
    },
  });

  const savedDoc = await instance.save();
  console.log({ savedDoc });
}

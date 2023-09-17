import { ObjectId } from 'mongodb';
import BigNumber from 'bignumber.js';

import { IBookingForm } from '../../../../types';

export default function generateBookingFormData(currentValues: IBookingForm) {
  const {
    customer,
    vehicle,
    downPayment: {
      amount: downPayment,
      paymentMode: { value: paymentModeId },
    },
    total,
  } = currentValues;
  const customerId = customer?._id;
  const vehicleId = vehicle?._id;

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

  return {
    ...currentValues,
    customer: {
      ...customer,
      _id: new ObjectId(customerId),
    },
    vehicle: {
      ...vehicle,
      _id: new ObjectId(vehicleId),
    },
    balance,
  };
}

import { ObjectId } from 'mongodb';
import BigNumber from 'bignumber.js';

import { IBookingForm } from '../../../../types';

export default function generateBookingFormData(currentValues: IBookingForm) {
  const { customer, vehicle } = currentValues;
  const customerId = customer?._id;
  const vehicleId = vehicle?._id;

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
  };
}

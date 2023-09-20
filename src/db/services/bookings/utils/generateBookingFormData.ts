// import { ObjectId } from 'mongodb';

import { IBookingForm } from '../../../../types';

export default function generateBookingFormData(currentValues: IBookingForm) {
  const { customer, vehicle } = currentValues;
  const customerId = customer?._id;
  const vehicleId = vehicle?._id;

  return {
    ...currentValues,
    customer: {
      ...customer,
      _id: customerId,
    },
    vehicle: {
      ...vehicle,
      _id: vehicleId,
    },
  };
}

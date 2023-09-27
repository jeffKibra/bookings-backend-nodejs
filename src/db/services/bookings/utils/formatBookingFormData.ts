// import { ObjectId } from 'mongodb';

import { IBookingForm } from '../../../../types';

export default function formatBookingFormData(currentValues: IBookingForm) {
  const { customer, vehicle, startDate, endDate } = currentValues;
  const customerId = customer?._id;
  const vehicleId = vehicle?._id;

  //generate selected dates array

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

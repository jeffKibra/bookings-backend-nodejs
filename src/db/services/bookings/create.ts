import BigNumber from 'bignumber.js';
import { ObjectId } from 'mongodb';
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

  const formattedFormData = generateBookingFormData(formData);

  const instance = new BookingModel({
    ...formattedFormData,
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

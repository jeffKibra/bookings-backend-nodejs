import { ClientSession } from 'mongoose';
//
import { BookingModel } from '../../models';

export async function getItemBookedOnSelectedDates(
  orgId: string,
  selectedDates: string[],
  session?: ClientSession
) {
  const  booking=await BookingModel.findOne({
    orgId,
  });
}

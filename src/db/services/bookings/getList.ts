import { BookingModel } from '../../models';
//

export async function getList(orgId: string) {
  if (!orgId) {
    throw new Error('Invalid Params: orgId is required!');
  }

  const bookings = await BookingModel.find({
    'metaData.orgId': orgId,
  });

  console.log({ bookings });

  return bookings;
}

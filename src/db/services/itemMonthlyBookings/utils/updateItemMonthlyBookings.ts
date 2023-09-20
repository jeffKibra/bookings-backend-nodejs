import { ClientSession } from 'mongoose';
//
import { dates } from '../../../../utils';
//
// import { ItemYearlyBookings } from '../../../models';
//
import generateIncomingDates from './generateIncomingDates';
//

//
const { getDateDetails } = dates;

export default async function updateItemMonthlyBookings(
  session: ClientSession,
  orgId: string,
  itemId: string,
  newDates: string[],
  deletedDates: string[]
) {
  // console.log({ orgId, itemId, newDates, deletedDates });
  // const sampleDate = newDates[0] || deletedDates[0];
  // if (!sampleDate) {
  //   console.log('Selected dates and deleted dates are empty!', {
  //     newDates,
  //     deletedDates,
  //   });
  //   return;
  // }
  // const { year, month, yearMonth } = getDateDetails(new Date(sampleDate));
  // const filterOptions = { itemId, yearMonth, 'metaData.orgId': orgId };
  // const monthBookings = await ItemMonthlyBookings.findOne({
  //   ...filterOptions,
  // });
  // console.log(`item ${itemId} bookings for month ${yearMonth}}`, {
  //   monthBookings,
  // });
  // const datesFromDB = monthBookings?.dates || [];
  // // console.log({ datesFromDB, newDates, deletedDates });
  // const incomingDates = generateIncomingDates(
  //   datesFromDB,
  //   newDates,
  //   deletedDates
  // );
  // console.log({ incomingDates });
  // const writeResult = await ItemMonthlyBookings.updateOne(
  //   { ...filterOptions },
  //   {
  //     $set: {
  //       itemId,
  //       year,
  //       month,
  //       yearMonth,
  //       dates: incomingDates,
  //       metaData: {
  //         orgId,
  //         modifiedAt: Date.now(),
  //       },
  //     },
  //   },
  //   {
  //     session,
  //     upsert: true,
  //   }
  // );
  // return writeResult;
}

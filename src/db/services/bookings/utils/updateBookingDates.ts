import { ClientSession, UpdateWriteOpResult } from 'mongoose';
//
import { utils } from '../../itemMonthlyBookings';
//
const { updateItemBookings } = utils;

export default async function updateBookingDates(
  session: ClientSession,
  orgId: string,
  incomingItemId: string,
  currentItemId: string,
  incomingSelectedDates: string[],
  currentSelectedDates: string[]
) {
  const isSameItem = incomingItemId === currentItemId;
  console.log({ incomingItemId, currentItemId, isSameItem });

  //   const writeResults: (UpdateWriteOpResult | undefined)[] = [];

  if (isSameItem) {
    //update item monthly bookings
    await updateItemBookings(
      session,
      orgId,
      incomingItemId,
      incomingSelectedDates,
      currentSelectedDates
    );
    // console.log('combinedWriteResults: ', combinedWriteResults);
    // writeResults.push(combinedWriteResults);
  } else {
    //update incomingItem monthly bookings-additive update
    await updateItemBookings(
      session,
      orgId,
      incomingItemId,
      incomingSelectedDates
    );
    // console.log('incomingItemWriteResults', incomingItemWriteResults);
    //update currentItem monthly bookings-subtractive update
    await updateItemBookings(
      session,
      orgId,
      currentItemId,
      [],
      currentSelectedDates
    );
    // console.log('currentItemWriteResults', currentItemWriteResults);
  }
}

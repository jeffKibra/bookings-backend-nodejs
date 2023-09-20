import { ClientSession } from 'mongoose';
//
// import updateItemMonthlyBookings from './updateItemMonthlyBookings';
import updateItemYearlyBookings from './updateItemYearlyBookings';

//
import getBookingDatesMapping from './getBookingDatesMapping';

export default function updateItemBookings(
  session: ClientSession,
  orgId: string,
  itemId: string,
  incomingSelectedDates: string[],
  currentSelectedDates: string[] = []
) {
  const bookingDatesMapping = getBookingDatesMapping(
    incomingSelectedDates,
    currentSelectedDates
  );
  console.log('bookingDatesMapping', bookingDatesMapping);

  const years = Object.keys(bookingDatesMapping);

  return Promise.all(
    years.map(year => {
      const mapping = bookingDatesMapping[year];
      console.log(`year ${year} dates mapping`, mapping);

      const { incoming, deleted } = mapping;

      //
      return updateItemYearlyBookings(
        session,
        orgId,
        itemId,
        Object.keys(incoming || {}),
        Object.keys(deleted || {})
      );
    })
  );
}

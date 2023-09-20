import getRemainingDatesInMonth from './getRemainingDatesInMonth';
import checkIfIsSameMonth from './checkIfIsSameMonth';
import getFebDays from './getFebDays';
import confirmFutureDate from './confirmFutureDate';

export default function getDatesWithinRange(
  start: string | Date,
  end: string | Date
) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const endDateIsValid = confirmFutureDate(startDate, endDate);

  if (!endDateIsValid) {
    throw new Error('Booking end date must be after start date!');
  }

  const months: { [index: number]: number } = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
  };

  function updateLeapYear(year: number) {
    const febDays = getFebDays(year);

    months[2] = febDays;
  }

  //
  let month = startDate.getMonth() + 1;
  let year = startDate.getFullYear();
  let day = startDate.getDate();
  //

  /**
   * update months before starting loop
   */
  updateLeapYear(year);

  const datesGroupedInMonths: Record<string, string[]> = {};
  const ungroupedDates: string[] = [];

  //eslint-disable-next-line
  while (true) {
    /**
     * generate data first
     */
    const daysInMonth = months[month];
    const dateToday = new Date(`${year}/${month}/${day}`);
    const endDateIsSameMonth = checkIfIsSameMonth(dateToday, endDate);
    const lastDayOfTheMonth = endDateIsSameMonth
      ? endDate.getDate()
      : daysInMonth;

    const monthDates = getRemainingDatesInMonth(dateToday, lastDayOfTheMonth);
    // console.log({ monthDates });
    datesGroupedInMonths[monthDates.month] = monthDates.dates;
    ungroupedDates.push(...monthDates.dates);
    /**
     * check if we need to break the loop
     *
     */
    if (endDateIsSameMonth) {
      break;
    }
    /**
     * increment global trackers
     */
    day = 1; //reset to first day of the month
    //increase month by 1
    if (month === 12) {
      /**
       * is new month value greater than 12,
       * reset month to one and increase year  by one
       */
      month = 1;
      year += 1;
      /**
       * year has changed
       * update leap year values
       */
      updateLeapYear(year);
    } else {
      month += 1;
    }
  }

  // console.log({ datesGroupedInMonths, ungroupedDates });

  return { datesGroupedInMonths, ungroupedDates };
}

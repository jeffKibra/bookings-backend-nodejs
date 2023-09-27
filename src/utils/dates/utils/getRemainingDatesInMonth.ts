import getMonthString from './getMonthString';
import getLocalDateValues from './getLocalDateValues';

export default function getRemainingDatesInMonth(
  start: Date,
  lastDayOfTheMonth: number
) {
  const { day: startDay, year, yearMonth } = getLocalDateValues(start);
  // console.log({ monthString });

  const dates: string[] = [];

  for (let day = startDay; day <= lastDayOfTheMonth; day++) {
    const { yearMonthDay } = getLocalDateValues(`${yearMonth}-${day}`);
    dates.push(yearMonthDay);
  }

  // console.log({ dates });

  return {
    month: `${yearMonth}`,
    dates,
  };
}

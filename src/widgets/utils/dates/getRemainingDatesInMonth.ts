// import getMonthString from "./getMonthString";
import getDateDetails from "./getDateDetails";

export default function getRemainingDatesInMonth(
  start: Date,
  lastDayOfTheMonth: number
) {
  const { yearMonth } = getDateDetails(new Date(start));
  const startDate = new Date(start);
  const startDay = startDate.getDate();

  const dates: Record<string, string> = {};

  for (let day = startDay; day <= lastDayOfTheMonth; day++) {
    const { yearMonthDay } = getDateDetails(new Date(`${yearMonth}-${day}`));
    dates[yearMonthDay] = yearMonthDay;
  }

  // console.log({ dates });

  return {
    month: yearMonth,
    dates,
  };
}

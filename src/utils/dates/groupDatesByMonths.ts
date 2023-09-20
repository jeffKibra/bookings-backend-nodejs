import getDateDetails from './getDateDetails';

type IDate = string[] | Date[];

export default function groupDatesByMonths(dates: IDate) {
  const groupedDates: Record<string, string[]> = {};

  dates.forEach(dt => {
    const date = new Date(dt);
    const { yearMonth, yearMonthDay } = getDateDetails(date);

    // console.log({ month, yearMonth, yearMonthDay });

    const currentMonthDates = groupedDates[yearMonth] || [];

    groupedDates[yearMonth] = [...currentMonthDates, yearMonthDay];
  });

  return groupedDates;
}

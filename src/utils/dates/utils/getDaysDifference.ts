import checkIfIsSameDay from './checkIfIsSameDay';
import getRemainingDaysInYear from './getRemainingDaysInYear';
import getYearsArray from './getYearsArray';

export default function getDaysDifference(
  startDate: Date = new Date(),
  lastDate: Date = new Date()
) {
  const isSameDay = checkIfIsSameDay(startDate, lastDate);
  if (isSameDay) {
    return 1;
  }

  if (startDate.getTime() > lastDate.getTime()) {
    throw new Error('last Date cannot be less than start Date!');
  }

  const startYear: number = startDate.getFullYear();
  const lastYear: number = lastDate.getFullYear();
  //
  const years = getYearsArray(startYear, lastYear);

  const daysDifference = years.reduce((acc, year) => {
    const firstDateOfYear = new Date(`${year}/01/01`);
    const lastDateOfYear = new Date(`${year}/12/31`);

    const firstDateToUse = year === startYear ? startDate : firstDateOfYear;
    const lastDateToUse = year === lastYear ? lastDate : lastDateOfYear;

    const remainingDaysInYear = getRemainingDaysInYear(
      firstDateToUse,
      lastDateToUse
    );

    return acc + remainingDaysInYear;
  }, 0);

  return daysDifference;
}

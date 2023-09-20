export default function getRemainingDaysInYear(
  startDate: Date,
  lastDate: Date
) {
  if (startDate.getFullYear() !== lastDate.getFullYear()) {
    throw new Error(
      'The two dates to retrieve remaining days in the year for must be in the same year!'
    );
  }

  const year = startDate.getFullYear();

  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();

  const lastMonth = lastDate.getMonth() + 1;
  const lastDay = lastDate.getDate();

  let month = startMonth;

  let totalDays = 0;

  while (month <= lastMonth) {
    const numberOfDaysInMonth = new Date(year, month, 0).getDate();
    const monthLastDay = month === lastMonth ? lastDay : numberOfDaysInMonth;
    const monthStartDay = month === startMonth ? startDay : 1;

    const daysDifference = monthLastDay - monthStartDay;
    const remainingDaysInMonth = daysDifference + 1; //add one(1) since we need to include last days

    totalDays += remainingDaysInMonth;

    month += 1;
  }

  return totalDays;
}

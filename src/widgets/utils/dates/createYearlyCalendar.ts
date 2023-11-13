import getDatesWithinRange from "./getDatesWithinRange";

export default function createYearlyCalendar(year: number) {
  const startDate = `${year}/Jan/01`;
  const endDate = `${year}/Dec/31`;

  const { datesGroupedInMonths } = getDatesWithinRange(startDate, endDate);

  const months: Record<string, string[]> = {};

  if (typeof datesGroupedInMonths === "object") {
    Object.keys(datesGroupedInMonths).forEach((monthId) => {
      const monthDates = datesGroupedInMonths[monthId];
      const monthDatesArray = Object.keys(monthDates);

      months[monthId] = monthDatesArray;
    });
  }

  return months;
}

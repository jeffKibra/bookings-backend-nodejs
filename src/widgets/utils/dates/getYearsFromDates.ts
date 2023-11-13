export default function getYearsFromDates(dates: string[] | Date[]) {
  if (!Array.isArray(dates)) {
    return [];
  }

  const yearsMap: Record<string, number> = {};

  dates.forEach((date) => {
    const year = new Date(date).getFullYear();

    yearsMap[year] = year;
  });

  const years = Object.keys(yearsMap);
  console.log({ years });

  return years;
}

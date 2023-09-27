export default function getYearsArray(startYear: number, lastYear: number) {
  const years: number[] = [];

  let currentYear = startYear;

  while (currentYear <= lastYear) {
    years.push(currentYear);

    currentYear += 1;
  }

  return years;
}

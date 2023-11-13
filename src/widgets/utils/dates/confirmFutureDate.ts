export default function confirmFutureDate(
  referenceDate: Date = new Date(),
  futureDate: Date = new Date()
) {
  const referenceYear: number = referenceDate.getFullYear();
  const referenceMonth: number = referenceDate.getMonth();
  const referenceMonthDate: number = referenceDate.getDate();

  const futureYear: number = futureDate.getFullYear();
  const futureMonth: number = futureDate.getMonth();
  const futureMonthDate: number = futureDate.getDate();

  let isLess = false;

  if (
    futureYear < referenceYear ||
    (referenceYear === futureYear && futureMonth < referenceMonth) ||
    (referenceYear === futureYear &&
      referenceMonth === futureMonth &&
      futureMonthDate < referenceMonthDate)
  ) {
    isLess = true;
  }

  return !isLess;
}

import { checkLeapYear } from ".";

export default function getFebDays(year: number) {
  let days = 28;

  const isLeapYear = checkLeapYear(year);
  if (isLeapYear) {
    days = 29;
  }

  return days;
}

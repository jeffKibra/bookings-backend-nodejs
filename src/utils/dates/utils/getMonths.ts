import { getFebDays } from ".";

export default function getMonths(year: number) {
  const months: { [index: number]: number } = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
  };

  //update leap year values
  const febDays = getFebDays(year);

  months[2] = febDays;

  return months;
}

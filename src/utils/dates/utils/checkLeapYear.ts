export default function checkLeapYear(year: number) {
  let isLeapYear = false;

  if (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) {
    //leap year
    isLeapYear = true;
  }

  return isLeapYear;
}

export default function checkIfDateIsValid(
  dateToCheck: string | number | Date
) {
  const dateIsInvalid = new Date(dateToCheck).toString() === 'Invalid Date';

  return !dateIsInvalid;
}

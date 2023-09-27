import checkIfDateIsValid from './checkIfDateIsValid';
import getDateDetails from './getDateDetails';
//
//timezones=['GMT', 'Africa/Nairobi' ]

export default function getLocalDateValues(
  date: string | number | Date,
  timeZone = 'Africa/Nairobi'
) {
  const dateIsValid = checkIfDateIsValid(date);
  if (!dateIsValid) {
    throw new Error('Invalid date when generating local timezone values');
  }

  return getDateDetails(date, timeZone);
}

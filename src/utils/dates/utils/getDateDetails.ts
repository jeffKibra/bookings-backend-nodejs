import checkIfDateIsValid from './checkIfDateIsValid';
//
//
//timezones=['GMT', 'Africa/Nairobi' ]

export default function getDateDetails(
  date: string | number | Date,
  timeZone = 'GMT'
) {
  const dateIsValid = checkIfDateIsValid(date);
  if (!dateIsValid) {
    throw new Error('Invalid date when generating date details');
  }

  const validDate = new Date(date);

  const timeZoneObject = {
    ...(timeZone ? { timeZone } : {}),
  };

  const day = +new Date(validDate).toLocaleDateString('en-US', {
    ...timeZoneObject,
    day: 'numeric',
  });
  const month = +new Date(validDate).toLocaleString('en-US', {
    ...timeZoneObject,
    month: 'numeric',
  });
  const monthString = new Date(validDate).toLocaleString('en-US', {
    ...timeZoneObject,
    month: 'short',
  });
  const year = +new Date(validDate).toLocaleString('en-US', {
    ...timeZoneObject,
    year: 'numeric',
  });
  const localDateAndTime = new Date(validDate).toLocaleString('en-US', {
    ...timeZoneObject,
  });

  const localDate = new Date(validDate).toLocaleDateString('en-US', {
    ...timeZoneObject,
  });

  const localTime = new Date(validDate).toLocaleTimeString('en-US', {
    ...timeZoneObject,
  });

  const dayString = String(day).padStart(2, '0');
  const yearMonth = `${year}-${monthString}`;
  const yearMonthDay = `${yearMonth}-${dayString}`;

  return {
    day,
    month, //first index is 1 not zero
    monthString,
    year,
    localDate,
    localTime,
    localDateAndTime,
    yearMonth,
    yearMonthDay,
    millis: validDate.getTime(),
  };
}

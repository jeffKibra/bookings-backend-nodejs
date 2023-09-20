import { dates } from '../../../../utils';
//
import { IBookingDatesMapping } from '../../../../types';

const { getDateDetails } = dates;

export default function getBookingDatesMapping(
  incomingSelectedDates: string[],
  currentSelectedDates: string[] = []
) {
  if (!Array.isArray(incomingSelectedDates)) {
    throw new Error('Incoming Selected Dates must be an array!');
  }

  const selectedDatesMapping: IBookingDatesMapping = {};

  const currentSelectedDatesMapping: Record<string, string> = {};
  currentSelectedDates.forEach(dateString => {
    currentSelectedDatesMapping[dateString] = dateString;
  });

  //create mapping for incoming dates for quick lookup
  incomingSelectedDates.forEach(dateString => {
    const { year } = getDateDetails(new Date(dateString));

    const incomingYearMapping = selectedDatesMapping[year] || {};
    const incoming = incomingYearMapping?.incoming || {};
    const unModified = incomingYearMapping?.unModified || {};
    const deleted = incomingYearMapping?.deleted || {};

    const isSimilar = Boolean(currentSelectedDatesMapping[dateString]);

    selectedDatesMapping[year] = {
      ...incomingYearMapping,
      incoming: {
        ...incoming,
        ...(isSimilar
          ? {}
          : {
              [dateString]: dateString,
            }),
      },
      unModified: {
        ...unModified,
        ...(isSimilar ? { [dateString]: dateString } : {}),
      },
      deleted,
    };

    if (isSimilar) {
      delete currentSelectedDatesMapping[dateString];
    }
  });

  /**
   * create 2 lists-
   * 1. deleted dates
   * 2. selected dates
   * find deleted dates by looping through current selected dates list.
   * if any date is not in incoming list, add it to deleted dates list
   */
  const remainingCurrentSelectedDates = Object.keys(
    currentSelectedDatesMapping
  );

  if (Array.isArray(remainingCurrentSelectedDates)) {
    remainingCurrentSelectedDates.forEach(dateString => {
      const { year } = getDateDetails(new Date(dateString));

      const currentYearMapping = selectedDatesMapping[year] || {};

      const incoming = currentYearMapping?.incoming || {};
      const unModified = currentYearMapping?.unModified || {};
      const deleted = currentYearMapping?.deleted || {};

      selectedDatesMapping[year] = {
        ...currentYearMapping,
        incoming,
        unModified,
        deleted: {
          ...deleted,
          [dateString]: dateString,
        },
      };
    });
  }

  console.log('selectedDatesMapping', selectedDatesMapping);

  return selectedDatesMapping;
}

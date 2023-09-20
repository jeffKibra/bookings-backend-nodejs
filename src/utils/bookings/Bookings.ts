//----------------------------------------------------------------

import {
  getDatesWithinRange,
  checkIfDateIsValid,
  getDateDetails,
} from '../../utils/dates';
//
import {
  // IBookingDateRange,
  IMonthlyBookings,
} from '../../types';

//----------------------------------------------------------------
//types
type IDatesWithinRangeResult = ReturnType<typeof getDatesWithinRange>;
type IUngroupedDates = IDatesWithinRangeResult['ungroupedDates'];
type IDatesGroupedInMonths = IDatesWithinRangeResult['datesGroupedInMonths'];

//----------------------------------------------------------------

export default class Bookings {
  //   ------------------------------------------------------------------
  //   Static methods
  //   -------------------------------------------------------------------

  //-----------------------------------------------------------------------
  //-----------------------------------------------------------------------

  //-----------------------------------------------------------------------
  //-----------------------------------------------------------------------
  static checkIfDateRangeIsValid(startDate: string, endDate: string): boolean {
    const startDateIsValid = checkIfDateIsValid(startDate);
    const endDateIsValid = checkIfDateIsValid(endDate);

    return startDateIsValid && endDateIsValid;
  }
  //-----------------------------------------------------------------------

  static convertStringArrayToObject(array: string[]) {
    const object: Record<string, string> = {};

    array.forEach(val => {
      object[val] = val;
    });

    return object;
  }

  //-----------------------------------------------------------------------

  static getDatesFromRange(dateRange: string, spliter: string = '_') {
    console.log({ dateRange });
    let startDate: string = '';
    let endDate: string = '';

    if (dateRange) {
      //split string to substring array
      const dateRangeArray = String(dateRange)
        .split(spliter)
        .filter(value => Boolean(value))
        .map(value => String(value).trim());
      console.log({ dateRangeArray });

      //update startDate and endDate variables
      startDate = dateRangeArray[0] || '';
      endDate = dateRangeArray[1] || '';

      const dateRangeIsValid = this.checkIfDateRangeIsValid(startDate, endDate);
      console.log({ dateRangeIsValid });

      if (!dateRangeIsValid) {
        throw new Error('Invalid  DateRange!');
      }
    }

    let ungroupedDates: IUngroupedDates = [];
    let datesGroupedInMonths: IDatesGroupedInMonths = {};

    if (startDate && endDate) {
      const datesRangeResult = getDatesWithinRange(startDate, endDate);
      ungroupedDates = datesRangeResult.ungroupedDates;
      datesGroupedInMonths = datesRangeResult.datesGroupedInMonths;
    }
    console.log({ datesGroupedInMonths, ungroupedDates });

    const ungroupedDatesObject =
      this.convertStringArrayToObject(ungroupedDates);

    return {
      startDate,
      endDate,
      ungroupedDates,
      ungroupedDatesObject,
      datesGroupedInMonths,
    };
  }

  //-----------------------------------------------------------------------

  //-----------------------------------------------------------------------
  //-----------------------------------------------------------------------

  //-----------------------------------------------------------------------
  //-----------------------------------------------------------------------

  //-----------------------------------------------------------------------
  // static get

  static getLocaleDate(date: Date, timeZone = 'Africa/Nairobi') {
    const localeDate = new Date(date).toLocaleString('en-US', {
      timeZone,
    });
    // console.log({ localeDate });

    return localeDate;
  }
  //----------------------------------------------------------------
  static checkIfSelectedBookingDateIsValid(
    date: string | number | Date,
    itemName: string,
    isStartDate = false
  ) {
    const dateNotValid = new Date(date).toDateString() === 'Invalid Date';
    // console.log({ dateNotValid });

    if (!date || dateNotValid) {
      throw new Error(
        `Invalid Booking ${
          isStartDate ? 'start' : 'end'
        } date for booking item: ${itemName}`
      );
    }
  }
  //----------------------------------------------------------------
}

///

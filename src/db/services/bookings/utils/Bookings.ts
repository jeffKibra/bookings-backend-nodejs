import {
  Transaction,
  FieldValue,
  Timestamp,
  DocumentSnapshot,
} from 'firebase-admin/firestore';
import BigNumber from 'bignumber.js';

//
import { getById } from '../getOne';
//
import {
  Account,
  IBookingForm,
  IBookingFromDb,
  IBooking,
  IBookingPayments,
} from '../../../../types';

//----------------------------------------------------------------

const { serverTimestamp, increment } = FieldValue;

interface IBookingDetails {
  orgId: string;
  vehicleId: string;
  bookingId: string;
  userUID: string;
}

//------------------------------------------------------------

export default class Bookings {
  orgId: string;
  vehicleId: string;
  transactionId: string;
  userUID: string;

  constructor(bookingDetails: IBookingDetails) {
    const { orgId, vehicleId, bookingId, userUID } = bookingDetails;

    this.orgId = orgId;
    this.vehicleId = vehicleId;
    this.transactionId = bookingId;
    this.userUID = userUID;
  }

  async create(bookingData: IBookingForm) {
    const {
      customer: { _id: customerId },
      downPayment: {
        amount: downPayment,
        paymentMode: { value: paymentModeId },
      },
      total,
    } = bookingData;

    if (downPayment > total) {
      throw new Error(
        `Failed to create Booking! Imprest given: ${Number(
          downPayment
        ).toLocaleString()} is more than the booking total amount: ${Number(
          total
        ).toLocaleString()}.`
      );
    }

    const balance = new BigNumber(total).minus(downPayment).dp(2).toNumber();
  }

  //   async getCurrentBooking() {
  //     const { orgId, transactionId, transaction } = this;

  //     const bookingRef = Bookings.createBookingRef(orgId, transactionId);

  //     const snap = await transaction.get(bookingRef);

  //     return Bookings.processbookingDataFromFirestore(snap);
  //   }

  //----------------------------------------------------------------

  //----------------------------------------------------------------

  async delete(bookingData: IBooking) {
    const { transactionId, orgId, userUID } = this;

    Bookings.validateDelete(bookingData);

    const {
      customer: { _id: customerId },
      downPayment: {
        paymentMode: { value: paymentModeId },
        amount: downPayment,
      },
    } = bookingData;

    /**
     * delete sale receipt
     */
    const downPaymentDecrement = new BigNumber(0 - downPayment)
      .dp(2)
      .toNumber();
  }

  //----------------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------------

  //----------------------------------------------------------------------

  //----------------------------------------------------------------------
  static generateBalanceAdjustment(
    incomingBooking: IBookingForm,
    currentBooking: IBooking
  ) {
    const {
      total: incomingTotal,
      downPayment: { amount: incomingDownPayment },
    } = incomingBooking;

    const {
      total: currentTotal,
      downPayment: { amount: currentDownPayment },
    } = currentBooking;

    /**
     * calculate balance adjustment
     */
    const currentBalanceWithoutPayments = new BigNumber(currentTotal).minus(
      currentDownPayment
    );
    const incomingBalanceWithoutPayments = new BigNumber(incomingTotal).minus(
      incomingDownPayment
    );
    const balanceAdjustment = incomingBalanceWithoutPayments
      .minus(currentBalanceWithoutPayments)
      .dp(2)
      .toNumber();
    // console.log({ balanceAdjustment });

    return balanceAdjustment;
  }

  //----------------------------------------------------------------
  static getPaymentsTotal(
    downPayment: number,
    paymentsReceived: IBookingPayments
  ) {
    const total = Object.values(paymentsReceived).reduce((sum, value) => {
      const payment = new BigNumber(value);
      return sum.plus(payment);
    }, new BigNumber(downPayment));

    return total.dp(2).toNumber();
  }

  //------------------------------------------------------------
  static async validateUpdate(
    orgId: string,
    bookingId: string,
    incomingBooking: IBookingForm | null
  ) {
    if (!incomingBooking) {
      throw new Error('Invalid Booking Form Data Received!.');
    }

    const currentBooking = await getById(orgId, bookingId);
    if (!currentBooking) {
      throw new Error(
        'Booking not found! Make sure the booking exists before editing.'
      );
    }

    const {
      total,
      customer: { _id: customerId },
      downPayment: { amount: downPayment },
    } = incomingBooking;
    const {
      customer: { _id: currentCustomerId },
      payments,
    } = currentBooking;
    const paymentsReceived  = payments?.amounts || {};
    /**
     * check to ensure the new total balance is not less than payments made.
     */
    const paymentsTotal = Bookings.getPaymentsTotal(
      downPayment,
      paymentsReceived
    );
    console.log({ paymentsTotal, total });
    /**
     * trying to update Booking total with an amount less than paymentsTotal
     * throw an error
     */
    if (paymentsTotal > total) {
      throw new Error(
        `Booking Update Failed! The new Booking Total is less than the Booking payments. If you are sure you want to edit, delete the associated payments or adjust them to be less than or equal to the new Booking total`
      );
    }

    const paymentsExcludingDownPayment = new BigNumber(paymentsTotal)
      .minus(downPayment)
      .dp(2)
      .toNumber();
    /**
     * check if customer has been changed
     */
    const customerHasChanged = currentCustomerId !== customerId;
    /**
     * customer cannot be changed if the Booking has some payments made to it
     */
    if (paymentsExcludingDownPayment > 0 && customerHasChanged) {
      throw new Error(
        `CUSTOMER cannot be changed in a Booking that has payments! This is because all the payments are from the PREVIOUS customer. If you are sure you want to change the customer, DELETE the associated payments first!`
      );
    }

    return {
      incomingBooking,
      currentBooking,
    };
  }

  //------------------------------------------------------------
  static validateDelete(booking: IBooking) {
    /**
     * check if the Booking has payments
     */
    const {
      downPayment: { amount: downPayment },
      payments: { amounts: paymentsReceived },
    } = booking;

    const paymentsTotal = Bookings.getPaymentsTotal(
      downPayment,
      paymentsReceived
    );

    const paymentsExcludingDownPayment = new BigNumber(paymentsTotal)
      .minus(downPayment)
      .dp(2)
      .toNumber();

    if (paymentsExcludingDownPayment > 0) {
      // deletion not allowed
      throw new Error(
        `Booking Deletion Failed! You cannot delete an Booking that has payments! If you are sure you want to delete it, Please DELETE all the associated PAYMENTS first!`
      );
    }
  }
}

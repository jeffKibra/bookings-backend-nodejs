import BigNumber from 'bignumber.js';
import { ObjectId } from 'mongodb';
import { ClientSession } from 'mongoose';
//
import { InvoiceModel } from '../../../../models';
//
import { paymentTerms } from '../../../../../constants';
//
import { getPaymentTermByValue } from '../../../paymentTerms';
//
import { getById } from '../getOne';
import { formatBookingFormData } from '.';

//
import {
  IAccount,
  IBookingForm,
  IBookingFromDb,
  IBooking,
  IBookingPayments,
  IInvoiceForm,
  ISaleItem,
} from '../../../../../types';

//----------------------------------------------------------------

interface IBookingDetails {
  orgId: string;
  vehicleId: string;
  bookingId: string;
  userUID: string;
}

//------------------------------------------------------------

const vehicleBookingsAccountId = 'vehicle_bookings';
const transferChargeAccountId = 'transfer_charge';

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

  //----------------------------------------------------------------

  //----------------------------------------------------------------

  //----------------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------------

  //----------------------------------------------------------------------
  static async createInvoiceFormFromBooking(
    orgId: string,
    bookingForm: IBookingForm
  ) {
    const paymentTerm = await getPaymentTermByValue(orgId, 'on_receipt');

    const {
      customer,
      customerNotes,
      vehicle,
      transferFee,
      // startDate,
      endDate,
      bookingRate,
      bookingTotal,
      selectedDates,
      subTotal,
      total,
      // downPayment,
      startDate,
    } = bookingForm;

    const bookedDaysCount = selectedDates?.length || 0;
    const vehicleBookingSubTotal = new BigNumber(bookingRate)
      .times(bookedDaysCount)
      .dp(2)
      .toNumber();
    const vehicleBookingTaxAmount = 0;
    // const vehicleBookingTotal = new BigNumber(vehicleBookingSubTotal)
    //   .plus(vehicleBookingTaxAmount)
    //   .dp(2)
    //   .toNumber();

    const {
      model: { make, model },
      color,
      _id: vehicleId,
    } = vehicle;

    const items: ISaleItem[] = [
      {
        itemId: vehicleId,
        name: vehicle.registration,
        qty: bookedDaysCount,
        rate: bookingRate,
        subTotal: vehicleBookingSubTotal,
        tax: vehicleBookingTaxAmount,
        total: bookingTotal,
        description: `${color} ${make} ${model}`,
        salesAccountId: vehicleBookingsAccountId,
        details: {
          item: vehicle,
          selectedDates,
          startDate,
          endDate,
          taxType: 'inclusive',
        },
      },
      {
        itemId: 'transfer_fee',
        name: 'Transfer Fee',
        rate: transferFee,
        qty: 1,
        subTotal,
        tax: 0,
        total: transferFee,
        description: '',
        salesAccountId: 'transfer_charge',
        details: { taxType: 'inclusive' },
      },
    ];

    const invoiceForm: IInvoiceForm = {
      customer,
      customerNotes,
      items,
      saleDate: new Date().toISOString(),
      dueDate: endDate,
      //
      // taxes:[],
      taxType: 'inclusive',
      totalTax: 0,
      discount: 0,
      subTotal,
      total,
      paymentTerm,
    };

    return invoiceForm;
  }
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

  static async findVehicleBookingWithAtleastOneOfTheSelectedDates(
    orgId: string,
    vehicleId: string,
    selectedDates: string[],
    session?: ClientSession
  ) {
    const booking = await InvoiceModel.findOne(
      {
        'items.0.itemId': vehicleId,
        'metaData.orgId': orgId,
        'metaData.status': 0,
        'items.0.details.selectedDates': { $in: [...selectedDates] },
      },
      {},
      { ...(session ? { session } : {}) }
    );

    console.log({ booking });

    return booking;
  }
  //------------------------------------------------------------
  static async validateFormData(
    orgId: string,
    formData: IBookingForm,
    session?: ClientSession
  ) {
    const {
      vehicle: { _id: vehicleId, registration },
      selectedDates,
    } = formData;

    const booking =
      await this.findVehicleBookingWithAtleastOneOfTheSelectedDates(
        orgId,
        vehicleId,
        selectedDates,
        session
      );

    if (booking) {
      const error = new Error(
        `Vehicle with registration ${registration} is already booked in some of the selected dates!`
      );
      error.name = 'unavailable';

      throw error;
    }
  }

  //------------------------------------------------------------
  static async validateUpdateFormData(
    orgId: string,
    currentBooking: IBooking,
    incomingBooking: IBookingForm,
    session?: ClientSession
  ) {
    const { vehicle: currentVehicle } = currentBooking;
    const { vehicle: incomingVehicle } = incomingBooking;

    const vehicle = incomingVehicle || currentVehicle;

    const formData = {
      ...incomingBooking,
      vehicle,
    };

    await this.validateFormData(orgId, formData, session);
  }

  //------------------------------------------------------------

  static async validateUpdate(
    orgId: string,
    bookingId: string,
    formData: IBookingForm | null,
    session?: ClientSession
  ) {
    if (!formData) {
      throw new Error('Invalid Booking Form Data Received!.');
    }

    const incomingBooking = formatBookingFormData(formData);

    const currentBooking = await getById(orgId, bookingId);
    if (!currentBooking) {
      throw new Error(
        'Booking not found! Make sure the booking exists before editing.'
      );
    }

    await this.validateUpdateFormData(
      orgId,
      currentBooking,
      incomingBooking,
      session
    );

    const {
      total,
      customer: { _id: customerId },
      downPayment: { amount: downPayment },
      selectedDates: incomingSelectedDates,
    } = incomingBooking;
    const {
      customer: { _id: currentCustomerId },
      payments,
      vehicle: { _id: vehicleId },
    } = currentBooking;
    const paymentsReceived = payments?.amounts || {};
    //

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

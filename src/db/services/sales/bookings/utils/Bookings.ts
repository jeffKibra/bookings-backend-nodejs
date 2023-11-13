import {
  Transaction,
  FieldValue,
  Timestamp,
  DocumentSnapshot,
} from 'firebase-admin/firestore';
import BigNumber from 'bignumber.js';

import { Sale } from '../../../sales/utils';

import {
  Account,
  IBookingForm,
  IBookingFromDb,
  IBooking,
  IBookingPayments,
} from '../../../../../types';

//----------------------------------------------------------------

const { serverTimestamp, increment } = FieldValue;

interface IBookingDetails {
  accounts: Record<string, Account>;
  orgId: string;
  itemId: string;
  bookingId: string;
  userId: string;
}

//------------------------------------------------------------

export default class Bookings extends Sale {
  constructor(transaction: Transaction, bookingDetails: IBookingDetails) {
    const { accounts, orgId, itemId, bookingId, userId } = bookingDetails;

    super(transaction, {
      accounts,
      orgId,
      itemId,
      transactionId: bookingId,
      transactionType: 'booking',
      userId,
      collectionPath: `organizations/${orgId}/bookings`,
    });
  }

  async create(bookingData: IBookingForm) {
    const {
      customer: { id: customerId },
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

    const { creditAccountsMapping, debitAccountsMapping, accountsSummary } =
      this.generateAccountsMappingAndSummary(bookingData);
    const {
      transaction,
      orgId,
      userId,
      transactionId,
      accounts,
      transactionType,
    } = this;

    /**
     * create sales
     */
    await this.createSale(
      bookingData,
      creditAccountsMapping,
      debitAccountsMapping
    );

    const isOverdue =
      transactionType === 'customer_opening_balance' ? true : false;
    const balance = new BigNumber(total).minus(downPayment).dp(2).toNumber();

    /**
     * create booking
     */
    const bookingsCollection = dbCollections(orgId).bookings;
    const bookingRef = bookingsCollection.doc(transactionId);
    // console.log({ salebookingData });
    transaction.create(bookingRef, {
      ...bookingData,
      balance,
      paymentsReceived: {},
      paymentsIds: [],
      paymentsCount: 0,
      isOverdue,
      status: 0,
      isSent: false,
      transactionType: 'booking',
      orgId,
      createdBy: userId,
      createdAt: serverTimestamp() as Timestamp,
      modifiedBy: userId,
      modifiedAt: serverTimestamp() as Timestamp,
    });
  }

  async getCurrentBooking() {
    const { orgId, transactionId, transaction } = this;

    const bookingRef = Bookings.createBookingRef(orgId, transactionId);

    const snap = await transaction.get(bookingRef);

    return Bookings.processbookingDataFromFirestore(snap);
  }

  //----------------------------------------------------------------

  //----------------------------------------------------------------

  async update(incomingBooking: IBookingForm, currentBooking: IBooking) {
    const { transaction, orgId, userId, transactionId, accounts } = this;

    Bookings.validateUpdate(incomingBooking, currentBooking);

    const { accountsSummary, creditAccountsMapping, debitAccountsMapping } =
      this.generateAccountsMappingAndSummary(incomingBooking, currentBooking);

    const {
      customer: { id: incomingCustomerId },
      total: incomingTotal,
      downPayment: {
        paymentMode: { value: incomingPaymentModeId },
        amount: incomingDownPayment,
      },
    } = incomingBooking;

    const {
      customer: { id: currentCustomerId },
      total: currentTotal,
      downPayment: {
        paymentMode: { value: currentPaymentModeId },
        amount: currentDownPayment,
      },
    } = currentBooking;

    const downPaymentAdjustment = new BigNumber(incomingDownPayment)
      .minus(currentDownPayment)
      .dp(2)
      .toNumber();
    const currentDownPaymentDecrement = new BigNumber(0 - currentDownPayment)
      .dp(2)
      .toNumber();

    /**
     * update sale
     */
    await this.updateSale(
      incomingBooking,
      currentBooking,
      creditAccountsMapping,
      debitAccountsMapping
    );

    /**
     * update org summary
     */
    const orgSummary = new OrgSummary(transaction, orgId, accounts);
    orgSummary.appendObject(accountsSummary);

    const paymentModeHasChanged =
      incomingPaymentModeId !== currentPaymentModeId;

    if (paymentModeHasChanged) {
      //increase debit amount of incoming mode
      orgSummary.debitPaymentMode(incomingPaymentModeId, incomingDownPayment);
      //reduce debit of current mode
      orgSummary.debitPaymentMode(
        currentPaymentModeId,
        currentDownPaymentDecrement
      );
    } else {
      orgSummary.debitPaymentMode(incomingPaymentModeId, downPaymentAdjustment);
    }

    orgSummary.update();
    /**
     * update customers summaries
     */
    const customerHasChanged = currentCustomerId !== incomingCustomerId;
    if (customerHasChanged) {
      const incomingCustomerSummary = new SummaryData(accounts);
      incomingCustomerSummary.append('bookings', 1, 0);
      //increment incoming customer payment mode debit
      incomingCustomerSummary.debitPaymentMode(
        incomingPaymentModeId,
        incomingDownPayment
      );
      //
      const currentCustomerSummary = new SummaryData(accounts);
      currentCustomerSummary.append('bookings', 0, 1);
      //decrease current customer payment mode debit
      currentCustomerSummary.debitPaymentMode(
        currentPaymentModeId,
        currentDownPaymentDecrement
      );

      this.changeCustomers(
        {
          saleDetails: incomingBooking,
          extraSummaryData: { ...incomingCustomerSummary.data },
        },
        {
          saleDetails: currentBooking,
          extraSummaryData: { ...currentCustomerSummary.data },
        }
      );
    } else {
      const customerSummary = new ContactSummary(
        transaction,
        orgId,
        incomingCustomerId,
        accounts
      );
      customerSummary.appendObject(orgSummary.data);
      customerSummary.update();
    }

    /**
     * calculate balance adjustment
     */
    const currentBalance = new BigNumber(currentTotal).minus(
      currentDownPayment
    );
    const incomingBalance = new BigNumber(incomingTotal).minus(
      incomingDownPayment
    );
    const balanceAdjustment = incomingBalance
      .minus(currentBalance)
      .dp(2)
      .toNumber();
    // console.log({ balanceAdjustment });

    /**
     * update sales receipt
     */
    const bookingsCollection = dbCollections(orgId).bookings;
    const bookingRef = bookingsCollection.doc(transactionId);
    transaction.update(bookingRef, {
      ...incomingBooking,
      balance: increment(balanceAdjustment) as unknown as number,
      // classical: "plus",
      modifiedBy: userId,
      modifiedAt: serverTimestamp(),
    });
  }

  async delete(bookingData: IBooking) {
    const { transaction, transactionId, orgId, userId, accounts } = this;

    Bookings.validateDelete(bookingData);

    const {
      customer: { id: customerId },
      downPayment: {
        paymentMode: { value: paymentModeId },
        amount: downPayment,
      },
    } = bookingData;

    const { accountsSummary, creditAccountsMapping, debitAccountsMapping } =
      this.generateAccountsMappingAndSummary(null, bookingData);

    /**
     * delete sale
     */
    await this.deleteSale(
      bookingData,
      creditAccountsMapping.deletedAccounts,
      debitAccountsMapping.deletedAccounts
    );
    /**
     * delete sale receipt
     */
    const downPaymentDecrement = new BigNumber(0 - downPayment)
      .dp(2)
      .toNumber();

    const summary = new SummaryData(accounts);
    summary.appendObject(accountsSummary);
    //decrease payment mode debit
    summary.debitPaymentMode(paymentModeId, downPaymentDecrement);
    summary.append('deletedbookings', 1, 0);

    const orgSummary = new OrgSummary(transaction, orgId, accounts);
    orgSummary.data = summary.data;
    orgSummary.update();

    const customerSummary = new ContactSummary(
      transaction,
      orgId,
      customerId,
      accounts
    );
    customerSummary.data = summary.data;
    customerSummary.update();

    /**
     * mark booking as deleted
     */
    const bookingsCollection = dbCollections(orgId).bookings;
    const bookingRef = bookingsCollection.doc(transactionId);
    transaction.update(bookingRef, {
      status: -1,
      modifiedBy: userId,
      modifiedAt: serverTimestamp(),
    });
  }

  //----------------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------------
  static createBookingRef(orgId: string, bookingId: string) {
    return dbCollections(orgId).bookings.doc(bookingId);
  }
  //----------------------------------------------------------------------
  static processbookingDataFromFirestore(
    docSnap: DocumentSnapshot<IBookingFromDb>
  ) {
    const data = docSnap.data();
    const id = docSnap.id;

    if (!docSnap.exists || !data || data.status === -1) {
      throw new Error(`Booking with id ${id} not found!`);
    }

    const booking: IBooking = {
      ...data,
      id,
    };
    return booking;
  }
  //----------------------------------------------------------------------

  static async getBookingData(
    orgId: string,
    bookingId: string
  ): Promise<IBooking> {
    const bookingRef = Bookings.createBookingRef(orgId, bookingId);
    const snap = await bookingRef.get();

    return Bookings.processbookingDataFromFirestore(snap);
  }

  //------------------------------------------------------------
  static createBookingId(orgId: string) {
    const bookingsCollection = dbCollections(orgId).bookings;

    const bookingId = bookingsCollection.doc().id;

    return bookingId;
  }

  //----------------------------------------------------------------
  static reformatDates(data: IBookingForm): IBookingForm {
    const { saleDate } = data;
    const formData = {
      ...data,
      saleDate: new Date(saleDate),
    };

    return formData;
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
  static validateUpdate(
    incomingBooking: IBookingForm,
    currentBooking: IBooking
  ) {
    const {
      total,
      customer: { id: customerId },
      downPayment: { amount: downPayment },
    } = incomingBooking;
    const {
      customer: { id: currentCustomerId },
      paymentsReceived,
    } = currentBooking;
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
  }

  //------------------------------------------------------------
  static validateDelete(booking: IBooking) {
    /**
     * check if the Booking has payments
     */
    const {
      downPayment: { amount: downPayment },
      paymentsReceived,
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

import { getFirestore, FieldValue, WriteBatch } from "firebase-admin/firestore";
import BigNumber from "bignumber.js";

import { dbCollections } from "../../../utils/firebase";
import Journal from "../../../utils/journal";
import { getAccountData } from "../../../utils/accounts";

import {
  Account,
  PaymentReceivedForm,
  TransactionTypes,
  PaymentReceived,
  IContactSummary,
  IBookingPaymentMapping,
} from "../../../types";

interface PaymentData {
  accounts: Record<string, Account>;
  orgId: string;
  userId: string;
  paymentId: string;
}

//-------------------------------------------------------------
const db = getFirestore();
const { serverTimestamp, increment, arrayUnion, arrayRemove } = FieldValue;

export default class BookingsPayments {
  batch: WriteBatch;
  accounts: Record<string, Account>;
  orgId: string;
  userId: string;
  paymentId: string;
  transactionType: keyof Pick<TransactionTypes, "customer_payment">;

  unearnedRevenue: Account;
  accountsReceivable: Account;

  constructor(batch: WriteBatch, paymentData: PaymentData) {
    const { accounts, orgId, userId, paymentId } = paymentData;

    this.batch = batch;

    this.accounts = accounts;
    this.orgId = orgId;
    this.userId = userId;
    this.paymentId = paymentId;

    this.transactionType = "customer_payment";

    this.unearnedRevenue = getAccountData("unearned_revenue", accounts);
    this.accountsReceivable = getAccountData("accounts_receivable", accounts);
  }

  makePayments(
    incomingPayment: PaymentReceivedForm | null,
    currentPayment?: PaymentReceived
  ) {
    const incomingCustomerId = incomingPayment?.customer?.id;
    const incomingAccountId = incomingPayment?.account?.accountId;

    const currentCustomerId = currentPayment?.customer?.id;
    const currentAccount = currentPayment?.account;
    const currentAccountId = currentAccount?.accountId;

    const customerHasChanged = incomingCustomerId !== currentCustomerId;

    if (customerHasChanged) {
      console.log("customer has changed");
    }
    /**
     * check if payment account has been changed
     */
    const paymentAccountHasChanged = incomingAccountId !== currentAccountId;

    const {
      similarPayments,
      paymentsToUpdate,
      paymentsToCreate,
      paymentsToDelete,
    } = BookingsPayments.getPaymentsMapping(
      currentPayment?.payments || {},
      incomingPayment?.payments || {}
    );
    console.log({
      similarPayments,
      paymentsToUpdate,
      paymentsToCreate,
      paymentsToDelete,
    });
    /**
     * create two different update values based on the accounts:
     * 1. accountsReceivable account
     * 2. deposit account
     * if either customer or deposit account has changed:
     * values include paymentsToUpdate and similarPayments
     * else, paymentsToUpdate only
     */
    const updatedPayments =
      customerHasChanged || paymentAccountHasChanged
        ? [...paymentsToUpdate, ...similarPayments]
        : paymentsToUpdate;

    if (paymentsToCreate.length > 0 && incomingPayment) {
      console.log("creating payments");
      this.payBookings(incomingPayment, paymentsToCreate);
    }

    if (updatedPayments.length > 0 && incomingPayment && currentAccountId) {
      console.log("updating payments");
      this.updateBookingsPayments(
        incomingPayment,
        currentAccountId,
        updatedPayments
      );
    }

    if (paymentsToDelete.length > 0 && currentAccount) {
      console.log("deleting payments");
      this.deleteBookingsPayments(currentAccount, paymentsToDelete);
    }
  }

  private payBookings(
    formData: PaymentReceivedForm,
    paymentsToCreate: IBookingPaymentMapping[]
  ) {
    const { orgId, userId, paymentId, batch, accountsReceivable } = this;
    // console.log({ account });
    const paymentAccount = formData.account;

    const contacts = BookingsPayments.createContactsFromCustomer(
      formData.customer
    );

    const journalInstance = new Journal(batch, userId, orgId);
    /**
     * update bookings with the current payment
     */
    paymentsToCreate.forEach((payment) => {
      const { bookingId, incoming } = payment;
      console.log({ bookingId, incoming, paymentId });

      if (incoming > 0) {
        //update booking
        const bookingRef = db.doc(
          `organizations/${orgId}/bookings/${bookingId}`
        );

        const paidBookingsCollection =
          BookingsPayments.getPaidBookingsCollection(orgId, paymentId);
        /**
         * credit accounts_receivable
         */
        journalInstance.creditAccount({
          transactionCollection: paidBookingsCollection,
          account: accountsReceivable,
          amount: incoming,
          transactionId: bookingId,
          transactionType: "booking_payment",
          contacts,
        });
        /**
         * debit payment account-
         */
        journalInstance.debitAccount({
          transactionCollection: paidBookingsCollection,
          account: paymentAccount,
          amount: incoming,
          transactionId: bookingId,
          transactionType: "booking_payment",
          contacts,
        });

        const adjustment = new BigNumber(0 - incoming).dp(2).toNumber();

        batch.update(bookingRef, {
          balance: increment(adjustment),
          paymentsCount: increment(1),
          paymentsIds: arrayUnion(paymentId),
          [`paymentsReceived.${paymentId}`]: incoming,
          modifiedBy: userId,
          modifiedAt: serverTimestamp(),
        });
      }
    });
  }

  //----------------------------------------------------------------
  private updateBookingsPayments(
    formData: PaymentReceivedForm,
    currentAccountId: string,
    paymentsToUpdate: IBookingPaymentMapping[]
  ) {
    const { orgId, userId, paymentId, batch, accountsReceivable } = this;
    // console.log({ account });
    const { account: incomingAccount } = formData;
    const { accountId: incomingAccountId } = incomingAccount;

    const contacts = BookingsPayments.createContactsFromCustomer(
      formData.customer
    );

    const journalInstance = new Journal(batch, userId, orgId);

    /**
     * update bookings with the current payment
     */
    paymentsToUpdate.forEach((payment) => {
      const { bookingId, incoming, current } = payment;
      console.log({ bookingId, incoming, paymentId });

      if (incoming > 0) {
        //update booking
        const bookingRef = db.doc(
          `organizations/${orgId}/bookings/${bookingId}`
        );

        const paidBookingsCollection =
          BookingsPayments.getPaidBookingsCollection(orgId, paymentId);
        const paidBookingPath = `${paidBookingsCollection}/${bookingId}`;
        /**
         * accounts receivable account should be credited
         */
        journalInstance.creditAccount({
          transactionCollection: paidBookingsCollection,
          account: accountsReceivable,
          amount: incoming,
          transactionId: bookingId,
          transactionType: "booking_payment",
          contacts,
        });
        /**
         * deposit accounts
         */
        const paymentAccountHasChanged = incomingAccountId !== currentAccountId;
        if (paymentAccountHasChanged) {
          //delete previous account entry
          journalInstance.deleteEntry(paidBookingPath, currentAccountId);
        }
        //debit incoming account
        journalInstance.debitAccount({
          transactionCollection: paidBookingsCollection,
          transactionId: bookingId,
          account: incomingAccount,
          amount: incoming,
          transactionType: "booking_payment",
          contacts,
        });

        const adjustment = new BigNumber(current - incoming).dp(2).toNumber();

        batch.update(bookingRef, {
          balance: increment(adjustment),
          [`paymentsReceived.${paymentId}`]: incoming,
          modifiedBy: userId,
          modifiedAt: serverTimestamp(),
        });
      }
    });
  }

  //---------------------------------------------------------------------

  private deleteBookingsPayments(
    paymentAccount: Account,
    paymentsToDelete: IBookingPaymentMapping[]
  ) {
    const { batch, userId, orgId, paymentId, accounts } = this;

    const accountsReceivable = getAccountData("accounts_receivable", accounts);

    const journalInstance = new Journal(batch, userId, orgId);

    paymentsToDelete.forEach((payment) => {
      const { current, bookingId } = payment;
      const paidBookingPath = BookingsPayments.getPaidBookingPath(
        orgId,
        paymentId,
        bookingId
      );
      dbCollections(orgId).paymentsReceived.path;
      //delete accounts_receivable entry
      journalInstance.deleteEntry(
        paidBookingPath,
        accountsReceivable.accountId
      );
      //delete paymentAccount entries
      journalInstance.deleteEntry(paidBookingPath, paymentAccount.accountId);

      const bookingRef = db.doc(`organizations/${orgId}/bookings/${bookingId}`);
      batch.update(bookingRef, {
        balance: increment(current),
        paymentsCount: increment(-1),
        paymentsIds: arrayRemove(paymentId),
        [`paymentsReceived.${paymentId}`]: FieldValue.delete(),
        modifiedBy: userId,
        modifiedAt: serverTimestamp(),
      });
    });
  }

  //----------------------------------------------------------------

  //----------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------
  static getPaymentsTotal(payments: { [key: string]: number }) {
    if (!payments) return 0;

    const amounts = Object.values(payments);
    if (amounts.length === 0) return 0;

    const paymentsTotal = amounts.reduce((sum, amount) => {
      return sum + +amount;
    }, 0);

    return paymentsTotal;
  }

  //----------------------------------------------------------------
  static getPaidBookingsCollection(orgId: string, paymentId: string) {
    const paymentsReceivedCollection =
      dbCollections(orgId).paymentsReceived.path;
    //delete accounts_receivable entry
    return `${paymentsReceivedCollection}/${paymentId}/paidBookings`;
  }
  //------------------------------------------------------------
  static getPaidBookingPath(
    orgId: string,
    paymentId: string,
    bookingId: string
  ) {
    const collection = BookingsPayments.getPaidBookingsCollection(
      orgId,
      paymentId
    );
    return `${collection}/${bookingId}`;
  }
  //----------------------------------------------------------------
  static getPaymentsMapping(
    currentPayments: { [key: string]: number },
    incomingPayments: { [key: string]: number }
  ) {
    /**
     * new array to hold all the different values
     * no duplicates
     */
    const paymentsToDelete: IBookingPaymentMapping[] = [];
    const paymentsToUpdate: IBookingPaymentMapping[] = [];
    const paymentsToCreate: IBookingPaymentMapping[] = [];
    const similarPayments: IBookingPaymentMapping[] = [];
    /**
     * are the Payment similar.
     * traverse Payment and remove similar Payment from incomingIds arrays
     * if incomingIds length is greater than zero(0)
     * traverse incomingIds and add incoming payments to unique payments object
     * keep track of current and incoming amounts in the uniquePayments array
     */
    const currentbookingIds = Object.keys(currentPayments);
    const incomingBookingIds = Object.keys(incomingPayments);

    currentbookingIds.forEach((bookingId) => {
      const current = currentPayments[bookingId];
      const incoming = incomingPayments[bookingId] || 0;
      const dataMapping = {
        current,
        incoming,
        bookingId,
      };
      /**
       * get index of booking Id for incoming ids to remove it
       */
      const index = incomingBookingIds.findIndex((id) => id === bookingId);
      if (index > -1) {
        /**
         * similar booking has been found-check if tha amounts are equal
         * if equal, add to similars array-else add to paymentsToUpdate array
         */
        if (current === incoming) {
          similarPayments.push(dataMapping);
        } else {
          paymentsToUpdate.push(dataMapping);
        }
        //use splice function to remove booking from incomingIds array.
        incomingBookingIds.splice(index, 1);
      } else {
        /**
         * booking not in incoming payments
         * add it to paymentsToDelete
         */
        paymentsToDelete.push(dataMapping);
      }
    });
    /**
     * check if there are payments remaining in incomingIds array
     * this is a completely new payment- add then to paymentsToCreate array
     */
    if (incomingBookingIds.length > 0) {
      incomingBookingIds.forEach((bookingId) => {
        const dataMapping = {
          current: 0,
          incoming: incomingPayments[bookingId],
          bookingId,
        };

        paymentsToCreate.push(dataMapping);
      });
    }

    const uniquePayments = [
      ...paymentsToCreate,
      ...paymentsToUpdate,
      ...paymentsToDelete,
      ...similarPayments,
    ];

    return {
      uniquePayments,
      similarPayments,
      paymentsToCreate,
      paymentsToUpdate,
      paymentsToDelete,
    };
  }

  //------------------------------------------------------------
  static validateBookingPayments(
    paymentTotal: number,
    payments: { [key: string]: number }
  ) {
    const bookingPaymentsTotal = BookingsPayments.getPaymentsTotal(payments);
    if (bookingPaymentsTotal > paymentTotal) {
      throw new Error(
        "bookings payments cannot be more than customer payment!"
      );
    }

    return bookingPaymentsTotal;
  }
  //------------------------------------------------------------
  static createContactsFromCustomer(customer: IContactSummary) {
    const { id, ...contactDetails } = customer;

    const contacts: Record<string, IContactSummary> = {
      [id]: {
        ...contactDetails,
        id,
      },
    };

    return contacts;
  }
}

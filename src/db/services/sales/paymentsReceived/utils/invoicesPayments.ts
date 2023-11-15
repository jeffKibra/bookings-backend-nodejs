import { ClientSession } from 'mongoose';

import BigNumber from 'bignumber.js';

import { JournalEntry } from '../../../journal';
import { Accounts } from '../../../accounts';
import { getAccountData } from '../../../utils/accounts';

import {
  IAccountSummary,
  IPaymentReceivedForm,
  TransactionTypes,
  IPaymentReceived,
  IContactSummary,
  IInvoicePaymentMapping,
} from '../../../../../types';

interface PaymentData {
  orgId: string;
  userId: string;
  paymentId: string;
}

//-------------------------------------------------------------

const URAccountId = 'unearned_revenue';
const ARAccountId = 'accounts_receivable';

export default class InvoicesPayments extends Accounts {
  URAccountId = 'unearned_revenue';
  ARAccountId = 'accounts_receivable';
  //
  session: ClientSession;
  orgId: string;
  userId: string;
  paymentId: string;
  transactionType: keyof Pick<TransactionTypes, 'customer_payment'>;

  constructor(session: ClientSession, paymentData: PaymentData) {
    const { orgId, userId, paymentId } = paymentData;

    super(session);

    this.session = session;

    this.orgId = orgId;
    this.userId = userId;
    this.paymentId = paymentId;

    this.transactionType = 'customer_payment';
  }

  makePayments(
    incomingPayment: IPaymentReceivedForm | null,
    currentPayment?: IPaymentReceived
  ) {
    const incomingCustomerId = incomingPayment?.customer?._id;
    const incomingAccountId = incomingPayment?.account?.accountId;

    const currentCustomerId = currentPayment?.customer?._id;
    const currentAccount = currentPayment?.account;
    const currentAccountId = currentAccount?.accountId;

    const customerHasChanged = incomingCustomerId !== currentCustomerId;

    if (customerHasChanged) {
      console.log('customer has changed');
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
    } = InvoicesPayments.getPaymentsMapping(
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
      console.log('creating payments');
      this.payInvoices(incomingPayment, paymentsToCreate);
    }

    if (updatedPayments.length > 0 && incomingPayment && currentAccountId) {
      console.log('updating payments');
      this.updateInvoicesPayments(
        incomingPayment,
        currentAccountId,
        updatedPayments
      );
    }

    if (paymentsToDelete.length > 0 && currentAccount) {
      console.log('deleting payments');
      this.deleteInvoicesPayments(currentAccount, paymentsToDelete);
    }
  }

  private async payInvoices(
    formData: IPaymentReceivedForm,
    paymentsToCreate: IInvoicePaymentMapping[]
  ) {
    const { orgId, userId, paymentId, session } = this;
    // console.log({ account });
    const paymentAccount = formData.account;

    const contacts = [formData.customer];

    const ARAccount = await this.getAccountData(ARAccountId);
    //
    const journalInstance = new JournalEntry(session, userId, orgId);
    /**
     * update bookings with the current payment
     */
    paymentsToCreate.forEach(payment => {
      const { _id: invoiceId, incoming } = payment;
      console.log({ invoiceId, incoming, paymentId });

      if (incoming > 0) {
        //update booking

        /**
         * credit accounts_receivable
         */
        journalInstance.creditAccount({
          account: ARAccount,
          amount: incoming,
          transactionId: invoiceId,
          transactionType: 'invoice_payment',
          contacts,
          details: { invoiceId },
        });
        /**
         * debit payment account-
         */
        journalInstance.debitAccount({
          account: paymentAccount,
          amount: incoming,
          transactionId: invoiceId,
          transactionType: 'invoice_payment',
          contacts,
          details: { invoiceId },
        });

        // const adjustment = new BigNumber(0 - incoming).dp(2).toNumber();

        // batch.update(bookingRef, {
        //   balance: increment(adjustment),
        //   paymentsCount: increment(1),
        //   paymentsIds: arrayUnion(paymentId),
        //   [`paymentsReceived.${paymentId}`]: incoming,
        //   modifiedBy: userId,
        //   modifiedAt: serverTimestamp(),
        // });
      }
    });
  }

  //----------------------------------------------------------------
  private async updateInvoicesPayments(
    formData: IPaymentReceivedForm,
    currentAccountId: string,
    paymentsToUpdate: IInvoicePaymentMapping[]
  ) {
    const { orgId, userId, paymentId, session } = this;
    // console.log({ account });
    const { account: incomingAccount } = formData;
    const { accountId: incomingAccountId } = incomingAccount;

    const contacts = [formData.customer];

    const ARAccount = await this.getAccountData(ARAccountId);
    //
    const journalInstance = new JournalEntry(session, userId, orgId);

    /**
     * update bookings with the current payment
     */
    paymentsToUpdate.forEach(payment => {
      const { _id: invoiceId, incoming, current } = payment;
      console.log({ invoiceId, incoming, paymentId });

      if (incoming > 0) {
        //update booking

        /**
         * accounts receivable account should be credited
         */
        journalInstance.creditAccount({
          account: ARAccount,
          amount: incoming,
          transactionId: invoiceId,
          transactionType: 'invoice_payment',
          contacts,
          details: { invoiceId },
        });
        /**
         * deposit accounts
         */
        const paymentAccountHasChanged = incomingAccountId !== currentAccountId;
        if (paymentAccountHasChanged) {
          //delete previous account entry
          journalInstance.deleteEntry(paymentId, currentAccountId, {
            invoiceId,
          });
        }
        //debit incoming account
        journalInstance.debitAccount({
          transactionId: invoiceId,
          account: incomingAccount,
          amount: incoming,
          transactionType: 'invoice_payment',
          contacts,
          details: { invoiceId },
        });

        // const adjustment = new BigNumber(current - incoming).dp(2).toNumber();

        // batch.update(bookingRef, {
        //   balance: increment(adjustment),
        //   [`paymentsReceived.${paymentId}`]: incoming,
        //   modifiedBy: userId,
        //   modifiedAt: serverTimestamp(),
        // });
      }
    });
  }

  //---------------------------------------------------------------------

  private async deleteInvoicesPayments(
    paymentAccount: IAccountSummary,
    paymentsToDelete: IInvoicePaymentMapping[]
  ) {
    const { session, userId, orgId, paymentId, accounts } = this;

    const ARAccount = await this.getAccountData(ARAccountId);

    const journalInstance = new JournalEntry(session, userId, orgId);

    paymentsToDelete.forEach(payment => {
      const { _id: invoiceId } = payment;

      //delete accounts_receivable entry
      journalInstance.deleteEntry(paymentId, ARAccountId, { invoiceId });
      //delete paymentAccount entries
      journalInstance.deleteEntry(paymentId, paymentAccount.accountId, {
        invoiceId,
      });

      // const bookingRef = db.doc(`organizations/${orgId}/bookings/${invoiceId}`);
      // batch.update(bookingRef, {
      //   balance: increment(current),
      //   paymentsCount: increment(-1),
      //   paymentsIds: arrayRemove(paymentId),
      //   [`paymentsReceived.${paymentId}`]: FieldValue.delete(),
      //   modifiedBy: userId,
      //   modifiedAt: serverTimestamp(),
      // });
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

  //------------------------------------------------------------

  //----------------------------------------------------------------
  static getPaymentsMapping(
    currentPayments: { [key: string]: number },
    incomingPayments: { [key: string]: number }
  ) {
    /**
     * new array to hold all the different values
     * no duplicates
     */
    const paymentsToDelete: IInvoicePaymentMapping[] = [];
    const paymentsToUpdate: IInvoicePaymentMapping[] = [];
    const paymentsToCreate: IInvoicePaymentMapping[] = [];
    const similarPayments: IInvoicePaymentMapping[] = [];
    /**
     * are the Payment similar.
     * traverse Payment and remove similar Payment from incomingIds arrays
     * if incomingIds length is greater than zero(0)
     * traverse incomingIds and add incoming payments to unique payments object
     * keep track of current and incoming amounts in the uniquePayments array
     */
    const currentinvoiceIds = Object.keys(currentPayments);
    const incominginvoiceIds = Object.keys(incomingPayments);

    currentinvoiceIds.forEach(invoiceId => {
      const current = currentPayments[invoiceId];
      const incoming = incomingPayments[invoiceId] || 0;
      const dataMapping = {
        current,
        incoming,
        _id: invoiceId,
      };
      /**
       * get index of booking Id for incoming ids to remove it
       */
      const index = incominginvoiceIds.findIndex(id => id === invoiceId);
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
        incominginvoiceIds.splice(index, 1);
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
    if (incominginvoiceIds.length > 0) {
      incominginvoiceIds.forEach(invoiceId => {
        const dataMapping = {
          current: 0,
          incoming: incomingPayments[invoiceId],
          _id: invoiceId,
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
    const bookingPaymentsTotal = InvoicesPayments.getPaymentsTotal(payments);
    if (bookingPaymentsTotal > paymentTotal) {
      throw new Error(
        'bookings payments cannot be more than customer payment!'
      );
    }

    return bookingPaymentsTotal;
  }
  //------------------------------------------------------------
  // static createContactsFromCustomer(customer: IContactSummary) {
  //   const { id, ...contactDetails } = customer;

  //   const contacts: Record<string, IContactSummary> = {
  //     [id]: {
  //       ...contactDetails,
  //       id,
  //     },
  //   };

  //   return contacts;
  // }
}

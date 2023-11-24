import { ClientSession } from 'mongoose';

import BigNumber from 'bignumber.js';

import { InvoiceModel, PaymentReceivedModel } from '../../../../models';

import { JournalEntry } from '../../../journal';
import { Accounts } from '../../../accounts';

import {
  IAccountSummary,
  IPaymentReceivedForm,
  TransactionTypes,
  IPaymentReceived,
  IContactSummary,
  IPaidInvoiceMapping,
  IPaidInvoice,
  IInvoicePayment,
} from '../../../../../types';

interface PaymentData {
  orgId: string;
  userId: string;
  paymentId: string;
}

//-------------------------------------------------------------

const {
  commonIds: { AR: ARAccountId, UR: URAccountId },
} = Accounts;

export default class InvoicesPayments extends Accounts {
  //
  session: ClientSession;
  orgId: string;
  userId: string;
  paymentId: string;
  transactionType: keyof Pick<TransactionTypes, 'customer_payment'>;

  constructor(session: ClientSession, paymentData: PaymentData) {
    const { orgId, userId, paymentId } = paymentData;

    super(session, orgId);

    this.session = session;

    this.orgId = orgId;
    this.userId = userId;
    this.paymentId = paymentId;

    this.transactionType = 'customer_payment';
  }

  async makePayments(
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
      currentPayment?.paidInvoices || [],
      incomingPayment?.paidInvoices || []
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

    await Promise.all([
      this.payInvoices(paymentsToCreate, incomingPayment),
      this.updateInvoicesPayments(
        updatedPayments,
        incomingPayment,
        currentAccountId
      ),
      this.deleteInvoicesPayments(paymentsToDelete, currentAccount?.accountId),
    ]);
  }

  async getInvoicePayments(invoiceId: string) {
    const { session, orgId } = this;

    const total = await InvoicesPayments.getInvoicePayments(
      orgId,
      invoiceId,
      session
    );

    console.log({ total });
  }

  private async validateInvoicePayment(invoiceId: string, amount: number) {
    const { session, orgId } = this;

    const invoice = await InvoiceModel.findById(invoiceId, 'total', {
      session,
    }).exec();

    await this.getInvoicePayments(invoiceId);
    console.log({ invoice });
  }

  private async payInvoices(
    paymentsToCreate: IPaidInvoiceMapping[],
    formData?: IPaymentReceivedForm | null
  ) {
    const paramsAreValid =
      Array.isArray(paymentsToCreate) &&
      paymentsToCreate.length > 0 &&
      formData &&
      typeof formData === 'object';

    if (!paramsAreValid) {
      return;
    }

    console.log('creating payments');

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
    await Promise.all(
      paymentsToCreate.map(async payment => {
        const { invoiceId, incoming } = payment;
        console.log({ invoiceId, incoming, paymentId });

        this.validateInvoicePayment(invoiceId, incoming);

        const transactionId = `${paymentId}_${invoiceId}`;

        if (incoming > 0) {
          //update booking
          await Promise.all([
            /**
             * credit accounts_receivable
             */
            journalInstance.creditAccount({
              account: ARAccount,
              amount: incoming,
              transactionId,
              transactionType: 'invoice_payment',
              contacts,
              // details: { invoiceId },
            }),
            /**
             * debit payment account-
             */
            journalInstance.debitAccount({
              account: paymentAccount,
              amount: incoming,
              transactionId,
              transactionType: 'invoice_payment',
              contacts,
              // details: { invoiceId },
            }),
          ]);

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
      })
    );
  }

  //----------------------------------------------------------------
  private updateInvoicePaymentDepositAccount(
    journalInstance: JournalEntry,
    data: {
      invoiceId: string;
      contacts: IContactSummary[];
      incomingAmount: number;
      incomingAccount: IAccountSummary;
      currentAccountId: string;
    }
  ) {
    /**
     * deposit accounts
     */
    const { paymentId } = this;

    const {
      invoiceId,
      contacts,
      incomingAmount,
      incomingAccount,
      currentAccountId,
    } = data;
    const { accountId: incomingAccountId } = incomingAccount;

    const transactionId = `${paymentId}_${invoiceId}`;

    async function deletePrevAccountEntry() {
      const paymentAccountHasChanged = incomingAccountId !== currentAccountId;
      if (paymentAccountHasChanged) {
        //delete previous account entry
        await journalInstance.deleteEntry(transactionId, currentAccountId);
      }
    }

    return Promise.all([
      //debit incoming account
      journalInstance.debitAccount({
        transactionId,
        account: incomingAccount,
        amount: incomingAmount,
        transactionType: 'invoice_payment',
        contacts,
        details: { invoiceId },
      }),
      deletePrevAccountEntry(),
    ]);
  }
  //----------------------------------------------------------------

  private async updateInvoicesPayments(
    paymentsToUpdate: IPaidInvoiceMapping[],
    formData?: IPaymentReceivedForm | null,
    currentAccountId?: string
  ) {
    const paramsAreValid =
      Array.isArray(paymentsToUpdate) &&
      paymentsToUpdate.length > 0 &&
      formData &&
      typeof formData === 'object' &&
      currentAccountId;

    if (!paramsAreValid) {
      return;
    }

    console.log('updating payments');

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
    await Promise.all(
      paymentsToUpdate.map(async payment => {
        const { invoiceId, incoming, current } = payment;
        console.log({ invoiceId, incoming, paymentId });

        const transactionId = `${paymentId}_${invoiceId}`;

        if (incoming > 0) {
          //update booking

          await Promise.all([
            /**
             * accounts receivable account should be credited
             */
            journalInstance.creditAccount({
              account: ARAccount,
              amount: incoming,
              transactionId,
              transactionType: 'invoice_payment',
              contacts,
              details: { invoiceId },
            }),
            this.updateInvoicePaymentDepositAccount(journalInstance, {
              contacts,
              currentAccountId,
              incomingAccount,
              invoiceId,
              incomingAmount: incoming,
            }),
          ]);

          // const adjustment = new BigNumber(current - incoming).dp(2).toNumber();

          // batch.update(bookingRef, {
          //   balance: increment(adjustment),
          //   [`paymentsReceived.${paymentId}`]: incoming,
          //   modifiedBy: userId,
          //   modifiedAt: serverTimestamp(),
          // });
        }
      })
    );
  }

  //---------------------------------------------------------------------

  private async deleteInvoicesPayments(
    paymentsToDelete: IPaidInvoiceMapping[],
    paymentAccountId?: string
  ) {
    const paramsAreValid =
      Array.isArray(paymentsToDelete) &&
      paymentsToDelete.length > 0 &&
      paymentAccountId;

    if (!paramsAreValid) {
      return;
    }

    console.log('deleting payments');

    const { session, userId, orgId, paymentId } = this;

    const journalInstance = new JournalEntry(session, userId, orgId);

    await Promise.all(
      paymentsToDelete.map(async payment => {
        const { invoiceId } = payment;

        const transactionId = `${paymentId}_${invoiceId}`;

        await Promise.all([
          //delete accounts_receivable entry
          journalInstance.deleteEntry(transactionId, ARAccountId),
          //delete paymentAccount entries
          journalInstance.deleteEntry(transactionId, paymentAccountId),
        ]);

        // const bookingRef = db.doc(`organizations/${orgId}/bookings/${invoiceId}`);
        // batch.update(bookingRef, {
        //   balance: increment(current),
        //   paymentsCount: increment(-1),
        //   paymentsIds: arrayRemove(paymentId),
        //   [`paymentsReceived.${paymentId}`]: FieldValue.delete(),
        //   modifiedBy: userId,
        //   modifiedAt: serverTimestamp(),
        // });
      })
    );
  }

  //----------------------------------------------------------------

  //----------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------
  static getPaymentsTotal(
    paidInvoices: { invoiceId: string; amount: number }[]
  ) {
    if (!paidInvoices) return 0;

    const paymentsTotal = paidInvoices.reduce((sum, paidInvoice) => {
      const { amount } = paidInvoice;

      return sum + +amount;
    }, 0);

    return paymentsTotal;
  }

  //----------------------------------------------------------------

  //------------------------------------------------------------

  //----------------------------------------------------------------
  static getPaymentsMapping(
    currentPayments: { invoiceId: string; amount: number }[],
    incomingPayments: { invoiceId: string; amount: number }[]
  ) {
    /**
     * new array to hold all the different values
     * no duplicates
     */
    const paymentsToDelete: IPaidInvoiceMapping[] = [];
    const paymentsToUpdate: IPaidInvoiceMapping[] = [];
    const paymentsToCreate: IPaidInvoiceMapping[] = [];
    const similarPayments: IPaidInvoiceMapping[] = [];
    /**
     * are the Payment similar.
     * traverse Payment and remove similar Payment from incomingIds arrays
     * if incomingIds length is greater than zero(0)
     * traverse incomingIds and add incoming payments to unique payments object
     * keep track of current and incoming amounts in the uniquePayments array
     */

    const incomingPaymentsObject: Record<string, number> = {};
    incomingPayments.forEach(payment => {
      const { invoiceId, amount } = payment;

      if (amount < 0) {
        //cant have negative values
        throw new Error('Only positive numbers for payments allowed!');
      }

      incomingPaymentsObject[invoiceId] = amount;
    });

    const currentinvoiceIds = Object.keys(currentPayments);
    const incominginvoiceIds = Object.keys(incomingPayments);

    currentPayments.forEach(payment => {
      const { invoiceId, amount: current } = payment;
      const incoming = incomingPaymentsObject[invoiceId] || 0;

      if (current < 0 || incoming < 0) {
        //cant have negative values
        throw new Error('Only positive numbers for payments allowed!');
      }

      const dataMapping = {
        current,
        incoming,
        invoiceId,
      };

      if (incoming === 0) {
        /**
         * booking not in incoming payments
         * add it to paymentsToDelete
         */
        paymentsToDelete.push(dataMapping);
      } else {
        /**
         * similar booking has been found-check if tha amounts are equal
         * if equal, add to similars array-else add to paymentsToUpdate array
         */
        if (current === incoming) {
          similarPayments.push(dataMapping);
        } else {
          paymentsToUpdate.push(dataMapping);
        }
        /**
         * incoming invoice payment has been processed.
         * delete from list to avoid duplicates
         */
        delete incomingPaymentsObject[invoiceId];
      }
    });
    /**
     * process any remaining incoming invoices payments
     */
    Object.keys(incomingPaymentsObject).forEach(invoiceId => {
      const amount = incomingPaymentsObject[invoiceId] || 0;

      const dataMapping = {
        current: 0,
        incoming: amount,
        invoiceId,
      };

      paymentsToCreate.push(dataMapping);
    });

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
  static validateInvoicesPayments(
    paymentTotal: number,
    payments: IPaidInvoice[]
  ) {
    const bookingPaymentsTotal = InvoicesPayments.getPaymentsTotal(payments);

    if (bookingPaymentsTotal > paymentTotal) {
      throw new Error(
        'bookings payments cannot be more than customer payment!'
      );
    }

    return bookingPaymentsTotal;
  }

  static async getInvoicePayments(
    orgId: string,
    invoiceId: string,
    session: ClientSession | null
  ) {
    const result = await PaymentReceivedModel.aggregate<{
      list: IInvoicePayment[];
      total: { value: number };
    }>([
      {
        $match: {
          'metaData.orgId': orgId,
          'metaData.status': 0,
          'paidInvoices.invoiceId': invoiceId,
        },
      },
      {
        $unwind: '$paidInvoices',
      },
      {
        $match: {
          'paidInvoices.invoiceId': invoiceId,
        },
      },
      {
        $project: {
          paymentId: {
            $toString: '$_id',
          },
          amount: '$paidInvoices.amount',
        },
      },
      {
        $facet: {
          list: [],
          total: [
            {
              $group: {
                _id: null,
                value: {
                  $sum: '$amount',
                },
              },
            },
          ],
        },
      },
      {
        $set: {
          total: {
            $arrayElemAt: ['$total', 0],
          },
        },
      },
    ]).session(session);

    console.log({ result });

    const list = result[0]?.list;
    const total = result[0]?.total?.value || 0;

    return {
      list,
      total,
    };
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

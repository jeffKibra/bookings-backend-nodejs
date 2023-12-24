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
  IPaymentAllocationMapping,
  IPaymentAllocation,
  IUserPaymentAllocation,
  IInvoicePayment,
  IInvoicePaymentsResult,
} from '../../../../../types';

interface PaymentData {
  orgId: string;
  userId: string;
  paymentId: string;
}

//-------------------------------------------------------------

const {
  commonIds: { AR: ARAccountId, UR: URAccountId, UF: UFAccountId },
} = Accounts;

export default class InvoicesPayments extends Accounts {
  //
  session: ClientSession | null;
  orgId: string;
  userId: string;
  paymentId: string;
  transactionType: keyof Pick<TransactionTypes, 'customer_payment'>;

  constructor(session: ClientSession | null, paymentData: PaymentData) {
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
    //
    const currentCustomerId = currentPayment?.customer?._id;

    const customerHasChanged = incomingCustomerId !== currentCustomerId;

    if (customerHasChanged) {
      console.log('customer has changed');
    }
    /**
     * check if payment account has been changed
     */
    // const paymentAccountHasChanged = incomingAccountId !== currentAccountId;

    const {
      similarPayments,
      paymentsToUpdate,
      paymentsToCreate,
      paymentsToDelete,
    } = InvoicesPayments.getPaymentsMapping(
      currentPayment?.allocations || [],
      incomingPayment?.allocations || []
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
    const updatedPayments = customerHasChanged
      ? [...paymentsToUpdate, ...similarPayments]
      : paymentsToUpdate;

    await Promise.all([
      this.createPaymentAllocations(paymentsToCreate, incomingPayment),
      this.updatePaymentAllocations(
        updatedPayments,
        incomingPayment,
        UFAccountId
      ),
      this.deletePaymentAllocations(
        paymentsToDelete,
        UFAccountId
        // currentAccount?.accountId
      ),
    ]);
  }

  private async validateInvoicePayment(
    allocationMapping: IPaymentAllocationMapping
  ) {
    const { session, orgId } = this;
    const { ref, transactionType } = allocationMapping;

    if (transactionType === 'invoice_payment') {
      const invoice = await InvoiceModel.findById(ref, 'total', {
        session,
      }).exec();

      console.log({ invoice });

      //todo: verify incoming payment does not overpay the invoice

      const { total } = await InvoicesPayments.getInvoicePayments(
        orgId,
        ref,
        session
      );
    }
  }

  private async createPaymentAllocations(
    allocationsToCreate: IPaymentAllocationMapping[],
    formData?: IPaymentReceivedForm | null
  ) {
    const paramsAreValid =
      Array.isArray(allocationsToCreate) &&
      allocationsToCreate.length > 0 &&
      formData &&
      typeof formData === 'object';

    if (!paramsAreValid) {
      return;
    }

    console.log('creating payment allocations');

    const { orgId, userId, paymentId, session } = this;
    // console.log({ account });
    // const paymentAccount = formData.account;

    const contact = formData.customer;

    const [ARAccount, UFAccount] = await Promise.all([
      this.getAccountData(ARAccountId),
      this.getAccountData(UFAccountId),
    ]);
    //
    const journalInstance = new JournalEntry(session, userId, orgId);
    /**
     * update bookings with the current payment
     */
    await Promise.all(
      allocationsToCreate.map(async allocationMapping => {
        const { ref, incoming, transactionType } = allocationMapping;
        console.log({ ref, incoming, paymentId });

        this.validateInvoicePayment(allocationMapping);

        const transactionId = `${paymentId}_${ref}`;

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
              transactionType,
              contact,
              // details: { invoiceId },
            }),
            /**
             * debit payment account-
             */
            journalInstance.debitAccount({
              account: UFAccount,
              amount: incoming,
              transactionId,
              transactionType,
              contact,
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
  private updatePaymentAllocationDepositAccount(
    journalInstance: JournalEntry,
    data: {
      transactionId: string;
      contact: IContactSummary;
      incomingAmount: number;
      incomingAccount: IAccountSummary;
      currentAccountId: string;
      transactionType: keyof Pick<
        TransactionTypes,
        'customer_payment' | 'invoice_payment'
      >;
    }
  ) {
    /**
     * deposit accounts
     */

    const {
      contact,
      incomingAmount,
      incomingAccount,
      currentAccountId,
      transactionType,
      transactionId,
    } = data;

    // async function deletePrevAccountEntry() {
    //   const paymentAccountHasChanged = incomingAccountId !== currentAccountId;
    //   if (paymentAccountHasChanged) {
    //     //delete previous account entry
    //     await journalInstance.deleteEntry(transactionId, currentAccountId);
    //   }
    // }

    return Promise.all([
      //debit incoming account
      journalInstance.debitAccount({
        transactionId,
        account: incomingAccount,
        amount: incomingAmount,
        transactionType,
        contact,
        // details: { invoiceId },
      }),
      // deletePrevAccountEntry(),
    ]);
  }
  //----------------------------------------------------------------

  private async updatePaymentAllocations(
    allocationsToUpdate: IPaymentAllocationMapping[],
    formData?: IPaymentReceivedForm | null,
    currentAccountId?: string
  ) {
    const paramsAreValid =
      Array.isArray(allocationsToUpdate) &&
      allocationsToUpdate.length > 0 &&
      formData &&
      typeof formData === 'object' &&
      currentAccountId;

    if (!paramsAreValid) {
      return;
    }

    console.log('updating payment allocations');

    const { orgId, userId, paymentId, session } = this;
    // console.log({ account });
    // const { account: incomingAccount } = formData;
    // const { accountId: incomingAccountId } = incomingAccount;

    const contact = formData.customer;

    const [ARAccount, UFAccount] = await Promise.all([
      this.getAccountData(ARAccountId),
      this.getAccountData(UFAccountId),
    ]);
    //
    const journalInstance = new JournalEntry(session, userId, orgId);

    /**
     * update bookings with the current payment
     */
    await Promise.all(
      allocationsToUpdate.map(async allocationMapping => {
        const { ref, incoming, current, transactionType } = allocationMapping;
        console.log({ ref, incoming, paymentId });

        const transactionId = `${paymentId}_${ref}`;

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
              transactionType,
              contact,
              details: { ref },
            }),

            this.updatePaymentAllocationDepositAccount(journalInstance, {
              contact,
              currentAccountId,
              incomingAccount: UFAccount,
              transactionId,
              transactionType,
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

  private async deletePaymentAllocations(
    allocationsToDelete: IPaymentAllocationMapping[],
    paymentAccountId?: string
  ) {
    const paramsAreValid =
      Array.isArray(allocationsToDelete) &&
      allocationsToDelete.length > 0 &&
      paymentAccountId;

    if (!paramsAreValid) {
      return;
    }

    console.log('deleting payment allocations');

    const { session, userId, orgId, paymentId } = this;

    const journalInstance = new JournalEntry(session, userId, orgId);

    await Promise.all(
      allocationsToDelete.map(async allocationMapping => {
        const { ref } = allocationMapping;

        const transactionId = `${paymentId}_${ref}`;

        await Promise.all([
          //delete accounts_receivable entry
          journalInstance.deleteEntry(transactionId, ARAccountId),
          //delete paymentAccount entries
          journalInstance.deleteEntry(transactionId, paymentAccountId),
        ]);

        // const bookingRef = db.doc(`organizations/${orgId}/bookings/${invoiceId}`);
        // batch.update(bookingRef, {
        //   balance: increment(current),
        //   allocationsCount: increment(-1),
        //   allocationsIds: arrayRemove(paymentId),
        //   [`allocationsReceived.${paymentId}`]: FieldValue.delete(),
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
  static getPaymentsTotal(allocations: IUserPaymentAllocation[]) {
    if (!allocations) return 0;

    const paymentsTotal = allocations.reduce((sum, paidInvoice) => {
      const amount = new BigNumber(paidInvoice.amount || 0);

      return sum.plus(amount);
    }, new BigNumber(0));

    const paymentsTotalValue = paymentsTotal.dp(2).toNumber();

    return paymentsTotalValue;
  }

  //----------------------------------------------------------------

  //------------------------------------------------------------

  //----------------------------------------------------------------
  static getPaymentsMapping(
    currentAllocations: IPaymentAllocation[],
    incomingAllocations: IPaymentAllocation[]
  ) {
    /**
     * new array to hold all the different values
     * no duplicates
     */
    const paymentsToDelete: IPaymentAllocationMapping[] = [];
    const paymentsToUpdate: IPaymentAllocationMapping[] = [];
    const paymentsToCreate: IPaymentAllocationMapping[] = [];
    const similarPayments: IPaymentAllocationMapping[] = [];
    /**
     * are the Payment similar.
     * traverse Payment and remove similar Payment from incomingIds arrays
     * if incomingIds length is greater than zero(0)
     * traverse incomingIds and add incoming payments to unique payments object
     * keep track of current and incoming amounts in the uniquePayments array
     */

    const incomingAllocationsObject: Record<string, IPaymentAllocation> = {};
    incomingAllocations.forEach(allocation => {
      const { ref, amount } = allocation;

      if (amount < 0) {
        //cant have negative values
        throw new Error(
          `Only positive numbers for invoice payments allowed! ref: ${ref}`
        );
      }

      incomingAllocationsObject[ref] = allocation;
    });

    const currentinvoiceIds = Object.keys(currentAllocations);
    const incominginvoiceIds = Object.keys(incomingAllocations);

    currentAllocations.forEach(allocation => {
      const { ref, amount: current, transactionType } = allocation;
      const incoming = incomingAllocationsObject[ref]?.amount || 0;

      if (current < 0 || incoming < 0) {
        //cant have negative values
        throw new Error(
          `Only positive numbers for invoice payments allowed! ref: ${ref}`
        );
      }

      const dataMapping: IPaymentAllocationMapping = {
        current,
        incoming,
        ref,
        transactionType,
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
        delete incomingAllocationsObject[ref];
      }
    });
    /**
     * process any remaining incoming invoices payments
     */
    Object.keys(incomingAllocationsObject).forEach(ref => {
      const allocation = incomingAllocationsObject[ref];
      const { transactionType, amount } = allocation;

      const dataMapping: IPaymentAllocationMapping = {
        current: 0,
        incoming: amount,
        ref,
        transactionType,
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
    userAllocations: IUserPaymentAllocation[]
  ) {
    let paymentsTotal = new BigNumber(0);
    //
    const allocations: IPaymentAllocation[] = [];

    userAllocations.forEach(userAllocation => {
      const { amount, invoiceId } = userAllocation;

      if (amount > 0) {
        paymentsTotal.plus(amount);
        //
        allocations.push({
          amount,
          ref: invoiceId,
          transactionType: 'invoice_payment',
        });
      }
    });

    const invoicesPaymentsTotal = paymentsTotal.dp(2).toNumber();

    if (invoicesPaymentsTotal > paymentTotal) {
      throw new Error(
        'invoices payments cannot be more than customer payment!'
      );
    }

    const excess = new BigNumber(paymentTotal)
      .minus(invoicesPaymentsTotal)
      .dp(2)
      .toNumber();

    if (excess > 0) {
      allocations.push({
        amount: excess,
        ref: 'excess',
        transactionType: 'customer_payment',
      });
    }

    return { invoicesPaymentsTotal, excess, allocations };
  }

  static async getInvoicePayments(
    orgId: string,
    invoiceId: string,
    session?: ClientSession | null
  ) {
    // console.log({ orgId, invoiceId, session });
    const result = await PaymentReceivedModel.aggregate<IInvoicePaymentsResult>(
      [
        {
          $match: {
            'metaData.orgId': orgId,
            'metaData.status': 0,
            'allocations.ref': invoiceId,
          },
        },
        {
          $unwind: '$allocations',
        },
        {
          $match: {
            'allocations.ref': invoiceId,
          },
        },
        {
          $project: {
            paymentId: {
              $toString: '$_id',
            },
            amountRaw: '$allocations.amount',
            amount: {
              $toDouble: '$allocations.amount',
            },
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
                    $sum: '$amountRaw', //use raw since type is maintained at Decimal128
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
        {
          $set: {
            total: {
              $toDouble: '$total.value',
            },
          },
        },
      ]
    ).session(session || null);

    // console.log(`invoice ${invoiceId} payments result: `, result);

    const list = result[0]?.list || [];
    const total = result[0]?.total || 0;

    const invoicePayments: IInvoicePaymentsResult = { list, total };

    return invoicePayments;
  }
  //------------------------------------------------------------
  // static createContactFromCustomer(customer: IContactSummary) {
  //   const { id, ...contactDetails } = customer;

  //   const contact: Record<string, IContactSummary> = {
  //     [id]: {
  //       ...contactDetails,
  //       id,
  //     },
  //   };

  //   return contact;
  // }
}

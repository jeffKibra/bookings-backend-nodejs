import { ClientSession } from 'mongoose';

import BigNumber from 'bignumber.js';

import { InvoiceModel, PaymentReceivedModel } from '../../../../models';

import { InvoiceSale } from '../../invoices/utils';
import { JournalEntry } from '../../../journal';
import { Accounts } from '../../../accounts';
import PaymentAllocationsMapping from './paymentAllocationsMapping';
//

import {
  IAccountSummary,
  IPaymentReceivedForm,
  TransactionTypes,
  IPaymentReceived,
  IContactSummary,
  IPaymentAllocationMapping,
  IPaymentAllocationMappingResult,
  IPaymentAllocation,
  IUserPaymentAllocation,
  IInvoicePayment,
  IInvoicePaymentsResult,
  IJournalEntryTransactionId,
  PaymentTransactionTypes,
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
    allocationsMappingResult: IPaymentAllocationMappingResult,
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
      similarAllocations,
      allocationsToUpdate,
      allocationsToCreate,
      allocationsToDelete,
    } = allocationsMappingResult;

    console.log({
      similarAllocations,
      allocationsToUpdate,
      allocationsToCreate,
      allocationsToDelete,
    });
    /**
     * create two different update values based on the accounts:
     * 1. accountsReceivable account
     * 2. deposit account
     * if either customer or deposit account has changed:
     * values include allocationsToUpdate and similarAllocations
     * else, allocationsToUpdate only
     */
    const updatedAllocations = customerHasChanged
      ? [...allocationsToUpdate, ...similarAllocations]
      : allocationsToUpdate;

    await Promise.all([
      this.createPaymentAllocations(allocationsToCreate, incomingPayment),
      this.updatePaymentAllocations(
        updatedAllocations,
        incomingPayment,
        UFAccountId
      ),
      this.deletePaymentAllocations(
        allocationsToDelete,
        UFAccountId
        // currentAccount?.accountId
      ),
    ]);
  }

  private async writeToJournal(
    allocationsToWrite: IPaymentAllocationMapping[],
    contact?: IContactSummary
  ) {
    const { session, userId, orgId, paymentId } = this;

    const [ARAccount, UFAccount, URAccount] = await Promise.all([
      this.getAccountData(ARAccountId),
      this.getAccountData(UFAccountId),
      this.getAccountData(URAccountId),
    ]);
    //
    const journalInstance = new JournalEntry(session, userId, orgId);

    const results = await Promise.all(
      allocationsToWrite.map(async allocationMapping => {
        const { ref, incoming, transactionType } = allocationMapping;
        console.log({ ref, incoming, paymentId });

        const transactionId: IJournalEntryTransactionId = {
          primary: paymentId,
          secondary: ref,
        };
        // `${paymentId}_${ref}`;

        if (incoming <= 0) {
          return;
        }

        const accountToCredit =
          transactionType === 'customer_payment' ? URAccount : ARAccount;

        //update booking
        const result = await Promise.all([
          /**
           * credit accounts_receivable
           */
          journalInstance.creditAccount({
            account: accountToCredit,
            amount: incoming,
            transactionId,
            transactionType,
            contact,
            // details: { invoiceId },
          }),
          /**
           * debit payment account-
           */

          this.updatePaymentAllocationDepositAccount(journalInstance, {
            account: UFAccount,
            amount: incoming,
            transactionId,
            transactionType,
            contact,
            // currentDepositAccountId,
          }),
          // journalInstance.debitAccount({
          //   account: UFAccount,
          //   amount: incoming,
          //   transactionId,
          //   transactionType,
          //   contact,
          //   // details: { invoiceId },
          // }),
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

        return result;
      })
    );

    return results;
  }

  private createPaymentAllocations(
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

    const contact = formData.customer;

    return this.writeToJournal(allocationsToCreate, contact);
  }

  //----------------------------------------------------------------
  private updatePaymentAllocationDepositAccount(
    journalInstance: JournalEntry,
    data: {
      transactionId: IJournalEntryTransactionId;
      contact?: IContactSummary;
      amount: number;
      account: IAccountSummary;
      transactionType: keyof PaymentTransactionTypes;
      // currentAccountId: string;
    }
  ) {
    /**
     * deposit accounts
     */

    const {
      contact,
      amount,
      account,
      transactionType,
      transactionId,
      // currentAccountId,
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
        account,
        amount,
        transactionType,
        contact,
        // details: { invoiceId },
      }),
      // deletePrevAccountEntry(),
    ]);
  }
  //----------------------------------------------------------------

  private updatePaymentAllocations(
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

    const contact = formData.customer;

    return this.writeToJournal(allocationsToUpdate, contact);
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
        const { ref, transactionType } = allocationMapping;

        const transactionId: IJournalEntryTransactionId = {
          primary: paymentId,
          secondary: ref,
        };

        const accountToCredit =
          transactionType === 'invoice_payment' ? ARAccountId : URAccountId;

        await Promise.all([
          //delete accounts_receivable entry
          journalInstance.deleteEntry(transactionId, accountToCredit),
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

    const allocationsTotal = allocations.reduce((sum, paidInvoice) => {
      const amount = new BigNumber(paidInvoice.amount || 0);

      return sum.plus(amount);
    }, new BigNumber(0));

    const allocationsTotalValue = allocationsTotal.dp(2).toNumber();

    return allocationsTotalValue;
  }

  //----------------------------------------------------------------

  //------------------------------------------------------------

  //----------------------------------------------------------------

  //------------------------------------------------------------

  //------------------------------------------------------------

  static async validateInvoicesPayments(
    orgId: string,
    paymentTotal: number,
    incomingAllocations: IUserPaymentAllocation[],
    currentPaymentAllocations?: IPaymentAllocation[],
    session?: ClientSession | null
  ) {
    let allocationsTotal = new BigNumber(0);
    let invoicesPaymentsTotal = 0;
    let excess = 0;
    //
    const allocations: IPaymentAllocation[] = [];

    const pamInstance = new PaymentAllocationsMapping(
      currentPaymentAllocations
    );

    const isDeletion =
      incomingAllocations?.length === 0 &&
      Array.isArray(currentPaymentAllocations) &&
      currentPaymentAllocations?.length > 0;
    console.log({ isDeletion });

    if (!isDeletion) {
      function processIncomingAllocation(allocation: IPaymentAllocation) {
        allocations.push(allocation);

        //
        const allocationMapping =
          pamInstance.appendIncomingAllocation(allocation);

        return allocationMapping;
      }

      //
      await Promise.all(
        incomingAllocations.map(async incomingAllocation => {
          const {
            amount,
            invoiceId,
            transactionType: presetTransactionType,
          } = incomingAllocation;
          // console.log({ invoiceId, amount });

          if (amount > 0) {
            allocationsTotal = allocationsTotal.plus(amount);
            //

            const transactionType: keyof PaymentTransactionTypes =
              presetTransactionType || 'invoice_payment';

            const allocation: IPaymentAllocation = {
              amount,
              ref: invoiceId,
              transactionType,
            };
            //
            const allocationMapping = processIncomingAllocation(allocation);

            if (transactionType === 'invoice_payment') {
              const validationResult =
                await this.validateInvoicePaymentAllocation(
                  orgId,
                  allocationMapping,
                  session
                );
              //
              return validationResult;
            }
          }
        })
      );

      invoicesPaymentsTotal = allocationsTotal.dp(2).toNumber();

      if (invoicesPaymentsTotal > paymentTotal) {
        throw new Error(
          'invoices payments cannot be more than customer payment!'
        );
      }

      //

      excess = new BigNumber(paymentTotal)
        .minus(invoicesPaymentsTotal)
        .dp(2)
        .toNumber();

      if (excess > 0) {
        const excessAllocation: IPaymentAllocation = {
          amount: excess,
          ref: 'excess',
          transactionType: 'customer_payment',
        };
        //
        processIncomingAllocation(excessAllocation);
      }
    }

    // console.log({ excess, invoicesPaymentsTotal });
    // console.log('allocations total', allocationsTotal);

    // generate payment allocations mapping
    const allocationsMapping = pamInstance.generateMapping();

    console.log('allocations mapping', allocationsMapping);

    return { invoicesPaymentsTotal, excess, allocations, allocationsMapping };
  }

  static async validateInvoicePaymentAllocation(
    orgId: string,
    allocationMapping: IPaymentAllocationMapping,
    session?: ClientSession | null
  ) {
    const { ref, transactionType, incoming, current } = allocationMapping;

    if (incoming === current) {
      return;
    }

    if (transactionType === 'invoice_payment') {
      const invoiceId = ref;

      const { total: invoiceTotal, paymentsTotal } = await InvoiceSale.getById(
        orgId,
        invoiceId,
        session
      );

      const incomingPaymentsTotal = new BigNumber(paymentsTotal)
        .minus(current)
        .plus(incoming)
        .dp(2)
        .toNumber();

      if (incomingPaymentsTotal > invoiceTotal) {
        throw new Error(
          `The Incoming payments total (${incomingPaymentsTotal}) to invoice ${invoiceId} exceeds the invoice total amount (${invoiceTotal})!`
        );
      }
    }
  }

  static async getInvoicePayments(
    orgId: string,
    invoiceId: string,
    session?: ClientSession | null,
    idForPaymentToExclude?: string
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

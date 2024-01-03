import { ObjectId } from 'mongodb';
import { ClientSession } from 'mongoose';

import BigNumber from 'bignumber.js';

import { InvoiceModel, PaymentReceivedModel } from '../../../../models';

import { InvoiceSale } from '../../invoices/utils';
import { JournalTransaction } from '../../../journal';
import { Accounts } from '../../../accounts';
import PaymentReceivedJournal from './paymentReceivedJournal';
//

import {
  IAccountSummary,
  IPaymentReceivedForm,
  TransactionTypes,
  IPaymentReceived,
  IUserPaymentReceivedForm,
  IContactSummary,
  IPaymentAllocationMapping,
  IPaymentAllocationMappingResult,
  IPaymentAllocation,
  IUserPaymentAllocation,
  IInvoicePayment,
  IInvoicePaymentsResult,
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

export default class PaymentAllocations extends Accounts {
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

  async validatePaymentAllocations(
    incomingPayment: IUserPaymentReceivedForm | null,
    currentPayment?: IPaymentReceived | null
  ) {
    const { session, orgId, userId, paymentId } = this;

    let allocationsTotal = new BigNumber(0);
    let allocationsToInvoicesTotal = 0;
    let excess = 0;
    //

    //
    const allocations: IPaymentAllocation[] = [];

    const prjInstance = new PaymentReceivedJournal(session, {
      userId,
      orgId,
      transactionId: paymentId,
      accountsInstance: this,
    });

    if (currentPayment && typeof currentPayment === 'object') {
      prjInstance.appendCurrentPayment(currentPayment);
    }

    /**
     * enter branch if its not a deletion
     */
    if (incomingPayment) {
      const {
        customer,
        amount: paymentTotal,
        allocations: incomingAllocations,
      } = incomingPayment;

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
              invoiceId,
              transactionType,
            };
            //
            allocations.push(allocation);
            //
            const {
              creditResult: { current: currentAllocatedAmount },
            } = await prjInstance.appendIncomingAllocation(
              customer,
              allocation
            );
            //

            if (transactionType === 'invoice_payment') {
              /**
               * add check to prevent validation when creating down payment.
               * transactionType for down payment=invoice_down_payment
               */

              await PaymentAllocations.validateInvoicePaymentAllocation(
                orgId,
                allocation,
                currentAllocatedAmount,
                session
              );
              //
            }
          }

          return null;
        })
      );

      allocationsToInvoicesTotal = allocationsTotal.dp(2).toNumber();

      if (allocationsToInvoicesTotal > paymentTotal) {
        throw new Error(
          'invoices payments cannot be more than customer payment!'
        );
      }

      //

      excess = new BigNumber(paymentTotal)
        .minus(allocationsToInvoicesTotal)
        .dp(2)
        .toNumber();

      if (excess > 0) {
        prjInstance.appendIncomingExcess(customer, excess);
      }
    }

    // console.log({ excess, allocationsToInvoicesTotal });
    // console.log('allocations total', allocationsTotal);

    // generate payment allocations mapping
    const writeResult = await prjInstance.updateEntries();

    return {
      allocationsToInvoicesTotal,
      excess,
      allocations,
      writeResult,
    };
  }

  //----------------------------------------------------------------

  //----------------------------------------------------------------

  //---------------------------------------------------------------------

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

  static async validateInvoicePaymentAllocation(
    orgId: string,
    incomingAllocation: IPaymentAllocation,
    currentAllocatedAmount: number,
    session?: ClientSession | null
  ) {
    const {
      amount: incomingAllocatedAmount,
      invoiceId,
      transactionType,
    } = incomingAllocation;

    if (incomingAllocatedAmount === currentAllocatedAmount) {
      return;
    }

    if (transactionType === 'invoice_payment') {
      const { total: invoiceTotal, paymentsTotal } = await InvoiceSale.getById(
        orgId,
        invoiceId,
        session
      );

      const incomingPaymentsTotal = new BigNumber(paymentsTotal)
        .minus(currentAllocatedAmount)
        .plus(incomingAllocatedAmount)
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
            'allocations.invoiceId': new ObjectId(invoiceId),
          },
        },
        {
          $unwind: '$allocations',
        },
        {
          $match: {
            'allocations.invoiceId': new ObjectId(invoiceId),
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

  static checkIfIsInvoicePayment(
    transactionType: keyof PaymentTransactionTypes
  ) {
    return (
      transactionType === 'invoice_payment' ||
      transactionType === 'invoice_down_payment'
    );
  }

  static generateExcessAllocation(excessAmount: number) {
    const excessAllocation: IPaymentAllocation = {
      amount: excessAmount,
      invoiceId: 'excess',
      transactionType: 'customer_payment',
    };

    return excessAllocation;
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

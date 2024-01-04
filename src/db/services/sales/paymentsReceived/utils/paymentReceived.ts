import { ClientSession } from 'mongoose';
import { ObjectId } from 'mongodb';

import BigNumber from 'bignumber.js';
//
import { PaymentReceivedModel } from '../../../../models';

import { JournalEntry } from '../../../journal';

import PaymentAllocations, { IPaymentData } from './paymentAllocations';
import { Accounts } from '../../../accounts';

import {
  IAccountSummary,
  IPaymentReceivedForm,
  IUserPaymentReceivedForm,
  IPaymentReceivedFromDb,
  TransactionTypes,
  PaymentTransactionTypes,
  IPaymentReceived,
  IPaymentAllocation,
} from '../../../../../types';

//-------------------------------------------------------------

export default class PaymentReceived extends PaymentAllocations {
  constructor(session: ClientSession | null, paymentData: IPaymentData) {
    super(session, paymentData);
  }

  async fetchCurrentPayment() {
    const { paymentId } = this;

    const payment = await PaymentReceived.fetchPaymentData(paymentId);

    if (!payment) {
      throw new Error('Payment not found!');
    }

    return payment;
  }

  async create(formData: IUserPaymentReceivedForm) {
    const { session, orgId, userId, transactionType, paymentId } = this;
    console.log({ formData });

    const { allocations, excess } = await this.updatePaymentJournal(formData);

    const incomingPayment: IPaymentReceivedForm = { ...formData, allocations };

    /**
     * create new payment
     */

    const instance = new PaymentReceivedModel({
      ...incomingPayment,
      _id: new ObjectId(paymentId),
      excess,
      metaData: {
        status: 0,
        orgId,
        createdBy: userId,
        createdAt: new Date(),
        modifiedBy: userId,
        modifiedAt: new Date(),
        transactionType,
      },
    });

    const [result] = await Promise.all([instance.save({ session })]);

    return result;
  }

  //------------------------------------------------------------
  async update(
    formData: IUserPaymentReceivedForm,
    currentPayment: IPaymentReceived
  ) {
    console.log({ formData, currentPayment });

    const { allocations: incomingAllocations, excess: incomingExcess } =
      await this.updatePaymentJournal(formData, currentPayment);

    const incomingPayment: IPaymentReceivedForm = {
      ...formData,
      allocations: incomingAllocations,
    };

    /**
     * update payment
     */
    const [updatedPayment] = await Promise.all([
      this._update({
        ...incomingPayment,
        excess: incomingExcess,
      }),
    ]);

    // console.log({ transactionDetails });

    return updatedPayment;
  }

  protected async _update(
    data: IPaymentReceivedForm | Partial<IPaymentReceived>
  ) {
    const { session, paymentId, userId } = this;

    const result = await PaymentReceivedModel.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          ...data,
          'metaData.modifiedBy': userId,
          'metaData.modifiedAt': new Date(),
        },
      },
      {
        new: true,
        session,
      }
    ).exec();
    // console.log({ transactionDetails });

    const updatedPayment = result as unknown as PaymentReceived;

    return updatedPayment;
  }

  //------------------------------------------------------------
  async delete(paymentData: IPaymentReceived) {
    const { session } = this;

    await this.updatePaymentJournal(null, paymentData);

    /**
     * mark payment as deleted
     */
    const { paymentId, userId } = this;

    const [result] = await Promise.all([
      PaymentReceivedModel.findByIdAndUpdate(
        paymentId,
        {
          $set: {
            'metaData.status': -1,
            'metaData.modifiedBy': userId,
            'metaData.modifiedAt': new Date(),
          },
        },
        {
          session,
        }
      ).exec(),
    ]);

    return result;
  }

  //----------------------------------------------------------------

  //----------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------

  //------------------------------------------------------------
  static async fetchPaymentData(
    paymentId: string,
    populateInvoices: boolean = false
  ) {
    const result = await PaymentReceivedModel.aggregate([
      {
        $match: {
          _id: new ObjectId(paymentId),
        },
      },

      {
        $unwind: '$allocations',
      },
      ...(populateInvoices
        ? [
            {
              $lookup: {
                from: 'invoices',
                localField: 'allocations.invoiceId',
                foreignField: '_id',
                pipeline: [
                  {
                    $set: {
                      subTotal: {
                        $toDouble: '$subTotal',
                      },
                      totalTax: {
                        $toDouble: '$totalTax',
                      },
                      total: {
                        $toDouble: '$total',
                      },
                    },
                  },
                ],
                as: 'invoiceData',
              },
            },
          ]
        : []),
      {
        $set: {
          allocations: {
            $mergeObjects: [
              '$allocations',
              ...(populateInvoices
                ? [{ $arrayElemAt: ['$invoiceData', 0] }]
                : []),
              {
                amount: {
                  $toDouble: '$allocations.amount',
                },
              },
            ],
          },
          // 'allocations.amount': {
          //   $toDouble: '$allocations.amount',
          // },
        },
      },
      {
        $group: {
          _id: '$_id',
          allocations: {
            $push: '$allocations',
          },
          original: {
            $mergeObjects: '$$ROOT',
          },
        },
      },
      {
        $replaceWith: {
          $mergeObjects: [{}, '$original', { allocations: '$allocations' }],
        },
      },
      {
        $set: {
          _id: {
            $toString: '$_id',
          },
          amount: {
            $toDouble: '$amount',
          },
          excess: {
            $toDouble: '$excess',
          },
        },
      },
    ]);
    // findById(paymentId).exec();

    if (result.length === 0) {
      return null;
    }

    const paymentData = result[0] as IPaymentReceived;
    // console.log('paymentData', paymentData);

    return paymentData;
  }
  //----------------------------------------------------------------
  static reformatDates(
    data: IUserPaymentReceivedForm
  ): IUserPaymentReceivedForm {
    const { paymentDate } = data;
    const formData = {
      ...data,
      paymentDate: new Date(paymentDate),
    };

    return formData;
  }
}

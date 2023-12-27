import { ClientSession } from 'mongoose';
import { ObjectId } from 'mongodb';

import BigNumber from 'bignumber.js';
//
import { PaymentReceivedModel } from '../../../../models';

import { JournalEntry } from '../../../journal';

import InvoicesPayments from './invoicesPayments';
import { Accounts } from '../../../accounts';

import {
  IAccountSummary,
  IPaymentReceivedForm,
  IUserPaymentReceivedForm,
  IPaymentReceivedFromDb,
  TransactionTypes,
  IPaymentReceived,
  IPaymentAllocation,
} from '../../../../../types';

interface PaymentData {
  orgId: string;
  userId: string;
  paymentId: string;
}

//-------------------------------------------------------------

export default class PaymentReceived extends InvoicesPayments {
  transactionType: keyof Pick<TransactionTypes, 'customer_payment'>;

  constructor(session: ClientSession | null, paymentData: PaymentData) {
    const { orgId, userId, paymentId } = paymentData;

    super(session, { orgId, userId, paymentId });

    this.transactionType = 'customer_payment';
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

    // console.log({ data, orgId, userProfile });
    const { allocations: userAllocations, amount } = formData;

    const { allocations, allocationsMapping, excess } =
      await PaymentReceived.validateInvoicesPayments(
        orgId,
        amount,
        userAllocations,
        [],
        session
      );

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

    const [result] = await Promise.all([
      instance.save({ session }),
      /**
       * make the needed invoice payments
       */
      this.makePayments(allocationsMapping, incomingPayment),
      // overpay(),
    ]);

    return result;
  }

  //------------------------------------------------------------
  async update(
    formData: IUserPaymentReceivedForm,
    currentPayment: IPaymentReceived
  ) {
    console.log({ formData, currentPayment });
    const { session, orgId } = this;
    const { allocations: incomingUserAllocations, amount: incomingAmount } =
      formData;

    const {
      allocations: incomingAllocations,
      excess: incomingExcess,
      allocationsMapping,
    } = await PaymentReceived.validateInvoicesPayments(
      orgId,
      incomingAmount,
      incomingUserAllocations,
      currentPayment.allocations,
      session
    );
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
      /**
       * update invoice payments
       */
      this.makePayments(allocationsMapping, incomingPayment, currentPayment),
      // overpay(),
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
    const { allocations, amount } = paymentData;
    const currentPaymentAllocations = allocations;

    const { orgId, session } = this;

    const { allocationsMapping } =
      await PaymentReceived.validateInvoicesPayments(
        orgId,
        amount,
        [],
        currentPaymentAllocations,
        session
      );

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
      /**
       * update invoice payments
       */
      this.makePayments(allocationsMapping, null, paymentData),
      // overpay(),
    ]);

    return result;
  }

  //----------------------------------------------------------------

  //----------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------

  //------------------------------------------------------------
  static async fetchPaymentData(paymentId: string) {
    const result = await PaymentReceivedModel.aggregate([
      {
        $match: {
          _id: new ObjectId(paymentId),
        },
      },
      {
        $unwind: '$allocations',
      },
      {
        $set: {
          'allocations.amount': {
            $toDouble: '$allocations.amount',
          },
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

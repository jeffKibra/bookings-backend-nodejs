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
  IPaymentReceivedFromDb,
  TransactionTypes,
  IPaymentReceived,
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

  async create(formData: IPaymentReceivedForm) {
    const { session, orgId, userId, transactionType, paymentId } = this;
    console.log({ formData });

    // console.log({ data, orgId, userProfile });
    const { paidInvoices, amount } = formData;

    const paymentsTotal = PaymentReceived.validateInvoicesPayments(
      amount,
      paidInvoices
    );
    if (paymentsTotal > amount) {
      throw new Error(
        "Invoices payments cannot be more than the customer's payment!"
      );
    }
    // console.log({ paymentsTotal, excess });

    /**
     * create the all inclusive payment data
     */
    // console.log({ paymentData });

    /**
     * create overpayment
     */
    const excess = new BigNumber(amount - paymentsTotal).dp(2).toNumber();

    const overpayCB = this.overpay;
    function overpay() {
      if (excess > 0) {
        return overpayCB(excess, 0, formData);
      }
    }

    /**
     * create new payment
     */

    const instance = new PaymentReceivedModel({
      ...formData,
      _id: new ObjectId(paymentId),
      excess,
      metaData: {
        status: 0,
        orgId,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        modifiedBy: userId,
        modifiedAt: new Date().toISOString(),
        transactionType,
      },
    });

    const [result] = await Promise.all([
      instance.save({ session }),
      /**
       * make the needed invoice payments
       */
      this.makePayments(formData),
      overpay(),
    ]);

    return result;
  }

  //------------------------------------------------------------
  async update(
    incomingPayment: IPaymentReceivedForm,
    currentPayment: IPaymentReceived
  ) {
    console.log({ incomingPayment, currentPayment });
    const { session, userId, paymentId } = this;
    const { paidInvoices: incomingPayments, amount: incomingAmount } =
      incomingPayment;

    const incomingPaymentsTotal = PaymentReceived.validateInvoicesPayments(
      incomingAmount,
      incomingPayments
    );

    const { amount: currentAmount, paidInvoices: currentPayments } =
      currentPayment;
    const currentPaymentsTotal = PaymentReceived.validateInvoicesPayments(
      currentAmount,
      currentPayments
    );

    /**
     * excess amount - credit account with the excess amount
     */
    const incomingExcess = new BigNumber(incomingAmount - incomingPaymentsTotal)
      .dp(2)
      .toNumber();
    const currentExcess = new BigNumber(currentAmount - currentPaymentsTotal)
      .dp(2)
      .toNumber();

    const overpayCB = this.overpay;
    function overpay() {
      if (incomingExcess > 0 || currentExcess > 0) {
        return overpayCB(incomingExcess, currentExcess, incomingPayment);
      }
    }

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
      this.makePayments(incomingPayment, currentPayment),
      overpay(),
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
          'metaData.modifiedAt': new Date().toISOString(),
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
    const { paidInvoices, amount } = paymentData;
    const paymentsTotal = PaymentReceived.getPaymentsTotal(paidInvoices);

    /**
     * excess
     */
    const excess = new BigNumber(amount - paymentsTotal).dp(2).toNumber();

    const overpayCB = this.overpay;
    function overpay() {
      if (excess > 0) {
        return overpayCB(0, excess, paymentData);
      }
    }

    /**
     * mark payment as deleted
     */
    const { session, paymentId, userId } = this;

    const [result] = await Promise.all([
      PaymentReceivedModel.findByIdAndUpdate(
        paymentId,
        {
          $set: {
            'metaData.status': -1,
            'metaData.modifiedBy': userId,
            'metaData.modifiedAt': new Date().toISOString(),
          },
        },
        {
          session,
        }
      ).exec(),
      /**
       * update invoice payments
       */
      this.makePayments(null, paymentData),
      overpay(),
    ]);

    return result;
  }

  //----------------------------------------------------------------
  async overpay(
    incoming: number,
    current: number,
    formData?: IPaymentReceivedForm
  ) {
    const { session, orgId, userId, paymentId, transactionType } = this;

    const URAccount = await this.getAccountData(Accounts.commonIds.UR);

    const journalInstance = new JournalEntry(session, userId, orgId);

    const isDelete = current > 0 && incoming === 0;
    const isEqual = current === 0 && incoming === 0;

    if (isEqual) {
      return;
    } else if (isDelete) {
      await journalInstance.deleteEntry(paymentId, URAccount.accountId);
    } else {
      if (!formData) {
        throw new Error('Payment form data is required!');
      }

      const contact = formData.customer;

      await journalInstance.creditAccount({
        transactionId: paymentId,
        account: URAccount,
        amount: incoming,
        transactionType,
        contact,
      });
    }
  }

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
        $unwind: '$paidInvoices',
      },
      {
        $set: {
          'paidInvoices.amount': {
            $toDouble: '$paidInvoices.amount',
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          paidInvoices: {
            $push: '$paidInvoices',
          },
          original: {
            $mergeObjects: '$$ROOT',
          },
        },
      },
      {
        $replaceWith: {
          $mergeObjects: [{}, '$original', { paidInvoices: '$paidInvoices' }],
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
  static reformatDates(data: IPaymentReceivedForm): IPaymentReceivedForm {
    const { paymentDate } = data;
    const formData = {
      ...data,
      paymentDate: new Date(paymentDate),
    };

    return formData;
  }
}

import BigNumber from 'bignumber.js';
//
import { PaymentReceivedModel } from '../../../../models';

import { JournalEntry } from '../../../journal';

import PaymentSummary from './paymentSummary';

import {
  IAccountSummary,
  IPaymentReceivedForm,
  IPaymentReceivedFromDb,
  TransactionTypes,
  IPaymentReceived as IPaymentReceived,
} from '../../../../../types';
import { ClientSession } from 'mongoose';

interface PaymentData {
  orgId: string;
  userId: string;
  paymentId: string;
}

//-------------------------------------------------------------

export default class PaymentReceived extends PaymentSummary {
  transactionType: keyof Pick<TransactionTypes, 'customer_payment'>;

  constructor(session: ClientSession, paymentData: PaymentData) {
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
    const { session, orgId, userId, transactionType } = this;
    console.log({ formData });

    // console.log({ data, orgId, userProfile });
    const { payments, amount } = formData;

    const paymentsTotal = PaymentReceived.validateBookingPayments(
      amount,
      payments
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
     * make the needed invoice payments
     */
    this.makePayments(formData);

    /**
     * create overpayment
     */
    const excess = new BigNumber(amount - paymentsTotal).dp(2).toNumber();
    if (excess > 0) {
      this.overpay(excess, 0, formData);
    }
    /**
     * create new payment
     */

    const instance = new PaymentReceivedModel({
      ...formData,
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

    await instance.save({ session });
  }

  //------------------------------------------------------------
  async update(
    incomingPayment: IPaymentReceivedForm,
    currentPayment: IPaymentReceived
  ) {
    console.log({ incomingPayment, currentPayment });
    const { session, userId, paymentId } = this;
    const { payments: incomingPayments, amount: incomingAmount } =
      incomingPayment;

    const incomingPaymentsTotal = PaymentReceived.validateBookingPayments(
      incomingAmount,
      incomingPayments
    );

    const { amount: currentAmount, payments: currentPayments } = currentPayment;
    const currentPaymentsTotal = PaymentReceived.validateBookingPayments(
      currentAmount,
      currentPayments
    );

    /**
     * update invoice payments
     */
    this.makePayments(incomingPayment, currentPayment);

    /**
     * excess amount - credit account with the excess amount
     */
    const incomingExcess = new BigNumber(incomingAmount - incomingPaymentsTotal)
      .dp(2)
      .toNumber();
    const currentExcess = new BigNumber(currentAmount - currentPaymentsTotal)
      .dp(2)
      .toNumber();
    if (incomingExcess > 0 || currentExcess > 0) {
      this.overpay(incomingExcess, currentExcess, incomingPayment);
    }
    /**
     * update payment
     */
    const updatedPayment = await this._update({
      ...incomingPayment,
      excess: incomingExcess,
    });

    // console.log({ transactionDetails });

    return updatedPayment;
  }

  protected async _update(
    data: IPaymentReceivedForm | Partial<IPaymentReceivedFromDb>
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
    const { payments, amount } = paymentData;
    const paymentsTotal = PaymentReceived.getPaymentsTotal(payments);
    /**
     * update invoice payments
     */
    this.makePayments(null, paymentData);

    /**
     * excess
     */
    const excess = new BigNumber(amount - paymentsTotal).dp(2).toNumber();
    if (excess > 0) {
      this.overpay(0, excess, paymentData);
    }
    /**
     * mark payment as deleted
     */
    const { session, paymentId, userId } = this;

    const result = await PaymentReceivedModel.findByIdAndUpdate(
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
    ).exec();

    return result;
  }

  //----------------------------------------------------------------
  async overpay(
    incoming: number,
    current: number,
    formData?: IPaymentReceivedForm
  ) {
    const { session, orgId, userId, paymentId, transactionType } = this;

    const URAccount = await this.getAccountData(this.ARAccountId);

    const journalInstance = new JournalEntry(session, userId, orgId);

    const isDelete = current > 0 && incoming === 0;
    const isEqual = current === 0 && incoming === 0;

    if (isEqual) {
      return;
    } else if (isDelete) {
      journalInstance.deleteEntry(paymentId, URAccount.accountId);
    } else {
      if (!formData) {
        throw new Error('Payment form data is required!');
      }

      const contacts = [formData.customer];

      journalInstance.creditAccount({
        transactionId: paymentId,
        account: URAccount,
        amount: incoming,
        transactionType,
        contacts,
      });
    }
  }

  //----------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------

  //------------------------------------------------------------
  static async fetchPaymentData(paymentId: string) {
    const result = await PaymentReceivedModel.findById(paymentId).exec();

    if (!result) {
      return null;
    }

    const paymentData = result as unknown as IPaymentReceived;

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

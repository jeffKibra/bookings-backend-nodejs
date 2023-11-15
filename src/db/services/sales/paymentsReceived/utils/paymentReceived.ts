import BigNumber from 'bignumber.js';
//
import {} from '../../../../models';

import { JournalEntry } from '../../../journal';

import PaymentSummary from './paymentSummary';

import {
  IAccountSummary,
  PaymentReceivedForm,
  PaymentReceivedFromDb,
  TransactionTypes,
  PaymentReceived as PaymentReceivedData,
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
    const { orgId, paymentId } = this;

    const payment = await PaymentReceived.fetchPaymentData(orgId, paymentId);

    if (!payment) {
      throw new Error('Payment not found!');
    }

    return payment;
  }

  create(formData: PaymentReceivedForm) {
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
     * update org summary
     */
    // this.updateOrgSummary(formData);
    /**
     * update customer summary
     */
    // this.updateCustomerSummary(formData);
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
    batch.create(this.paymentRef, {
      ...formData,
      excess,
      paidInvoicesIds: Object.keys(payments),
      transactionType,
      status: 0,
      orgId,
      createdBy: userId,
      createdAt: serverTimestamp() as Timestamp,
      modifiedBy: userId,
      modifiedAt: serverTimestamp() as Timestamp,
    });
  }

  //------------------------------------------------------------
  update(
    incomingPayment: PaymentReceivedForm,
    currentPayment: PaymentReceivedData
  ) {
    console.log({ incomingPayment, currentPayment });
    const { batch, userId, paymentRef } = this;
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
     * update org summary
     */
    this.updateOrgSummary(incomingPayment, currentPayment);
    /**
     * update customers summaries
     */
    this.updateCustomerSummary(incomingPayment, currentPayment);
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
    // console.log({ transactionDetails });
    const newDetails = {
      ...incomingPayment,
      paidInvoicesIds: Object.keys(incomingPayments),
      excess: incomingExcess,
      modifiedBy: userId,
      modifiedAt: serverTimestamp(),
    };
    console.log({ newDetails });

    batch.update(paymentRef, { ...newDetails });
  }

  //------------------------------------------------------------
  delete(paymentData: PaymentReceivedData) {
    const { userId, batch, paymentRef } = this;

    const { payments, amount } = paymentData;
    const paymentsTotal = PaymentReceived.getPaymentsTotal(payments);
    /**
     * update invoice payments
     */
    this.makePayments(null, paymentData);
    /**
     * update org summary
     */
    this.updateOrgSummary(null, paymentData);
    /**
     * update customer summary
     */
    this.updateCustomerSummary(null, paymentData);
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
    batch.update(paymentRef, {
      status: -1,
      modifiedAt: serverTimestamp(),
      modifiedBy: userId,
    });
  }

  //----------------------------------------------------------------
  overpay(incoming: number, current: number, formData?: PaymentReceivedForm) {
    const {
      batch,
      orgId,
      userId,
      paymentId,
      transactionType,
      unearnedRevenue,
    } = this;

    const journalInstance = new Journal(batch, userId, orgId);
    const paymentsCollection = dbCollections(orgId).paymentsReceived.path;

    const paymentDocPath = `${paymentsCollection}/${paymentId}`;

    const isDelete = current > 0 && incoming === 0;
    const isEqual = current === 0 && incoming === 0;

    if (isEqual) {
      return;
    } else if (isDelete) {
      journalInstance.deleteEntry(paymentDocPath, unearnedRevenue.accountId);
    } else {
      if (!formData) {
        throw new Error('Payment form data is required!');
      }

      const contacts = PaymentSummary.createContactsFromCustomer(
        formData.customer
      );

      journalInstance.creditAccount({
        transactionCollection: paymentsCollection,
        transactionId: paymentId,
        account: unearnedRevenue,
        amount: incoming,
        transactionType,
        contacts,
      });
    }
  }

  //----------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------
  static async createPaymentId(orgId: string) {
    return dbCollections(orgId).paymentsReceived.doc().id;
  }

  //------------------------------------------------------------
  static async fetchPaymentData(orgId: string, paymentId: string) {
    const paymentsCollection = dbCollections(orgId).paymentsReceived;
    const paymentRef = paymentsCollection.doc(paymentId);
    const snap = await paymentRef.get();
    const data = snap.data();

    if (!snap.exists || !data || data?.status === -1) {
      throw new Error(`Payment data with id ${paymentId} not found!`);
    }

    const paymentData: PaymentReceivedData = {
      ...data,
      paymentId,
    };

    return paymentData;
  }
  //----------------------------------------------------------------
  static reformatDates(data: PaymentReceivedForm): PaymentReceivedForm {
    const { paymentDate } = data;
    const formData = {
      ...data,
      paymentDate: new Date(paymentDate),
    };

    return formData;
  }
}

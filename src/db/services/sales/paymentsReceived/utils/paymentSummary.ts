import { WriteBatch } from 'firebase-admin/firestore';
import BigNumber from 'bignumber.js';

// import {
//   OrgSummary,
//   SummaryData,
//   ContactSummary,
// } from "../../../utils/summaries";

import BookingsPayments from './invoicesPayments';

// import {
//   Account,
//   PaymentReceivedForm,
//   TransactionTypes,
//   PaymentReceived as PaymentReceivedData,
// } from "../../../types";

// interface PaymentData {
//   accounts: Record<string, Account>;
//   orgId: string;
//   userId: string;
//   paymentId: string;
// }

//-------------------------------------------------------------

export default class PaymentSummary extends BookingsPayments {
  // transactionType: keyof Pick<TransactionTypes, "customer_payment">;
  // constructor(batch: WriteBatch, paymentData: PaymentData) {
  //   const { accounts, orgId, userId, paymentId } = paymentData;
  //   super(batch, { accounts, orgId, userId, paymentId });
  //   this.transactionType = "customer_payment";
  // }
  // //------------------------------------------------------------
  // generateSummaryOnCreate(incomingPayment: PaymentReceivedForm) {
  //   const { accounts } = this;
  //   const {
  //     amount,
  //     paymentMode: { value: paymentModeId },
  //     account,
  //     payments,
  //   } = incomingPayment;
  //   const paymentsTotal = PaymentSummary.validateBookingPayments(
  //     amount,
  //     payments
  //   );
  //   const summaryInstance = new SummaryData(accounts);
  //   summaryInstance.debitPaymentMode(paymentModeId, amount);
  //   //debit deposit to account-petty_cash or undeposited_funds
  //   summaryInstance.debitAccount(account.accountId, amount);
  //   //credit accounts_receivable account
  //   summaryInstance.creditAccount(
  //     this.accountsReceivable.accountId,
  //     paymentsTotal
  //   );
  //   /**
  //    * excess amount - credit account with the excess amount
  //    */
  //   const excess = new BigNumber(amount - paymentsTotal).dp(2).toNumber();
  //   if (excess > 0) {
  //     //update summary-credit excess amount to unearned_revenue account
  //     summaryInstance.creditAccount(this.unearnedRevenue.accountId, excess);
  //     // //create journal entries
  //     // this.overpay(excess, 0, paymentData);
  //   }
  //   return summaryInstance.data;
  // }
  // //------------------------------------------------------------
  // generateSummaryOnUpdate(
  //   incomingPayment: PaymentReceivedForm,
  //   currentPayment: PaymentReceivedData
  // ) {
  //   const { accounts } = this;
  //   const {
  //     amount: currentAmount,
  //     payments: currentPayments,
  //     paymentMode: { value: currentPaymentModeId },
  //     account: { accountId: currentAccountId },
  //   } = currentPayment;
  //   const {
  //     amount: incomingAmount,
  //     payments: incomingPayments,
  //     paymentMode: { value: incomingPaymentModeId },
  //     account: { accountId: incomingAccountId },
  //   } = incomingPayment;
  //   const paymentModeHasChanged =
  //     currentPaymentModeId !== incomingPaymentModeId;
  //   const paymentAccountHasChanged = incomingAccountId !== currentAccountId;
  //   const currentPaymentsTotal =
  //     BookingsPayments.getPaymentsTotal(currentPayments);
  //   const currentExcess = currentAmount - currentPaymentsTotal;
  //   const incomingPaymentsTotal =
  //     BookingsPayments.getPaymentsTotal(incomingPayments);
  //   const incomingExcess = incomingAmount - incomingPaymentsTotal;
  //   const amountAdjustment = incomingAmount - currentAmount;
  //   const paymentsTotalAdjustment =
  //     incomingPaymentsTotal - currentPaymentsTotal;
  //   const summaryInstance = new SummaryData(accounts);
  //   //credit accounts_receivable account
  //   summaryInstance.creditAccount(
  //     this.accountsReceivable.accountId,
  //     paymentsTotalAdjustment
  //   );
  //   if (paymentAccountHasChanged) {
  //     //reduce current account debit amount
  //     summaryInstance.debitAccount(currentAccountId, 0 - currentAmount);
  //     //increase incoming account debit
  //     summaryInstance.debitAccount(incomingAccountId, incomingAmount);
  //   } else {
  //     summaryInstance.debitAccount(incomingAccountId, amountAdjustment);
  //   }
  //   if (paymentModeHasChanged) {
  //     //decrement current mode
  //     summaryInstance.debitPaymentMode(currentPaymentModeId, 0 - currentAmount);
  //     //increment incoming mode
  //     summaryInstance.debitPaymentMode(incomingPaymentModeId, incomingAmount);
  //   } else {
  //     summaryInstance.debitPaymentMode(incomingPaymentModeId, amountAdjustment);
  //   }
  //   /**
  //    * excess amount - credit account with the excess amount
  //    */
  //   const excessAdjustment = new BigNumber(incomingExcess - currentExcess)
  //     .dp(2)
  //     .toNumber();
  //   if (excessAdjustment !== 0) {
  //     //update summary-credit excess amount to unearned_revenue account
  //     summaryInstance.creditAccount(
  //       this.unearnedRevenue.accountId,
  //       excessAdjustment
  //     );
  //     // //create journal entries
  //     // this.overpay(incomingExcess, currentExcess, incomingPayment);
  //   }
  //   return summaryInstance.data;
  // }
  // //------------------------------------------------------------
  // generateSummaryOnDelete(currentPayment: PaymentReceivedData) {
  //   const { accounts } = this;
  //   const {
  //     amount,
  //     payments,
  //     paymentMode: { value: paymentModeId },
  //     account,
  //   } = currentPayment;
  //   const paymentsTotal = BookingsPayments.getPaymentsTotal(payments);
  //   const summaryInstance = new SummaryData(accounts);
  //   const adjustment = new BigNumber(0 - amount).dp(2).toNumber();
  //   const paymentsTotalAdjustment = new BigNumber(0 - paymentsTotal)
  //     .dp(2)
  //     .toNumber();
  //   //reduce paymentMode debit
  //   summaryInstance.debitPaymentMode(paymentModeId, adjustment);
  //   //reduce deposit account debit
  //   summaryInstance.debitAccount(account.accountId, adjustment);
  //   //reduce accounts receivable credit
  //   summaryInstance.creditAccount(
  //     this.accountsReceivable.accountId,
  //     paymentsTotalAdjustment
  //   );
  //   /**
  //    * excess amount - credit account with the excess amount
  //    */
  //   const excess = new BigNumber(amount - paymentsTotal).dp(2).toNumber();
  //   if (excess > 0) {
  //     //reduce unearned_revenue credit
  //     summaryInstance.creditAccount(this.unearnedRevenue.accountId, 0 - excess);
  //     // //create journal entries
  //     // this.overpay(0, excess);
  //   }
  //   return summaryInstance.data;
  // }
  // //------------------------------------------------------------
  // updatedOutgoingCustomerSummary(currentPayment: PaymentReceivedData) {
  //   const { batch, orgId, accounts } = this;
  //   const {
  //     customer: { id: customerId },
  //   } = currentPayment;
  //   const summaryInstance = new ContactSummary(
  //     batch,
  //     orgId,
  //     customerId,
  //     accounts
  //   );
  //   const summaryUpdateData = this.generateSummaryOnDelete(currentPayment);
  //   summaryInstance.data = summaryUpdateData;
  //   summaryInstance.append("deletedPayments", 1, 0);
  //   summaryInstance.update();
  // }
  // //------------------------------------------------------------
  // updateIncomingCustomerSummary(incomingPayment: PaymentReceivedForm) {
  //   const { batch, orgId, accounts } = this;
  //   const {
  //     customer: { id: customerId },
  //   } = incomingPayment;
  //   const summaryUpdateData = this.generateSummaryOnCreate(incomingPayment);
  //   const summaryInstance = new ContactSummary(
  //     batch,
  //     orgId,
  //     customerId,
  //     accounts
  //   );
  //   summaryInstance.data = summaryUpdateData;
  //   summaryInstance.append("payments", 1, 0);
  //   summaryInstance.update();
  // }
  // //------------------------------------------------------------
  // updateSimilarCustomerSummary(
  //   incomingPayment: PaymentReceivedForm,
  //   currentPayment: PaymentReceivedData
  // ) {
  //   const { batch, orgId, accounts } = this;
  //   const {
  //     customer: { id: customerId },
  //   } = incomingPayment;
  //   const summaryUpdateData = this.generateSummaryOnUpdate(
  //     incomingPayment,
  //     currentPayment
  //   );
  //   const summaryInstance = new ContactSummary(
  //     batch,
  //     orgId,
  //     customerId,
  //     accounts
  //   );
  //   summaryInstance.data = summaryUpdateData;
  //   summaryInstance.update();
  // }
  // //------------------------------  ------------------------------
  // updateCustomerSummary(
  //   incomingPayment: PaymentReceivedForm | null,
  //   currentPayment?: PaymentReceivedData
  // ) {
  //   const isCreate = !currentPayment && incomingPayment;
  //   const isUpdate = currentPayment && incomingPayment;
  //   const isDelete = currentPayment && !incomingPayment;
  //   if (isUpdate) {
  //     const currentCustomerId = currentPayment.customer.id;
  //     const incomingCustomerId = incomingPayment.customer.id;
  //     const customerHasChanged = currentCustomerId !== incomingCustomerId;
  //     if (customerHasChanged) {
  //       this.updatedOutgoingCustomerSummary(currentPayment);
  //       this.updateIncomingCustomerSummary(incomingPayment);
  //     } else {
  //       this.updateSimilarCustomerSummary(incomingPayment, currentPayment);
  //     }
  //   } else if (isCreate) {
  //     this.updateIncomingCustomerSummary(incomingPayment);
  //   } else if (isDelete) {
  //     this.updatedOutgoingCustomerSummary(currentPayment);
  //   } else {
  //     return;
  //   }
  // }
  // //------------------------------------------------------------
  // updateOrgSummary(
  //   incomingPayment: PaymentReceivedForm | null,
  //   currentPayment?: PaymentReceivedData
  // ) {
  //   const { batch, orgId, accounts } = this;
  //   const summaryInstance = new OrgSummary(batch, orgId, accounts);
  //   const isCreate = !currentPayment && incomingPayment;
  //   const isUpdate = currentPayment && incomingPayment;
  //   const isDelete = currentPayment && !incomingPayment;
  //   if (isUpdate) {
  //     summaryInstance.data = this.generateSummaryOnUpdate(
  //       incomingPayment,
  //       currentPayment
  //     );
  //   } else if (isCreate) {
  //     summaryInstance.data = this.generateSummaryOnCreate(incomingPayment);
  //     summaryInstance.append("payments", 1, 0);
  //   } else if (isDelete) {
  //     summaryInstance.data = this.generateSummaryOnDelete(currentPayment);
  //     summaryInstance.append("deletedPayments", 1, 0);
  //   } else {
  //     return;
  //   }
  //   summaryInstance.update();
  // }
  // //----------------------------------------------------------------
  // //static functions
  // //----------------------------------------------------------------
  // static getPaymentsTotal(payments: { [key: string]: number }) {
  //   if (!payments) return 0;
  //   const amounts = Object.values(payments);
  //   if (amounts.length === 0) return 0;
  //   const paymentsTotal = amounts.reduce((sum, amount) => {
  //     return sum + +amount;
  //   }, 0);
  //   return paymentsTotal;
  // }
}

import { FieldValue } from "firebase-admin/firestore";
import BigNumber from "bignumber.js";

import JournalEntry from "../journal/journal";

import { getAccountData } from "../accounts";

import { Account, AccountType } from "../../types";
interface AggregationData {
  [key: string]: number | FieldValue;
}

//------------------------------------------------------------
const { increment } = FieldValue;
export default class SummaryData {
  data: AggregationData;
  accounts: Record<string, Account>;

  static creationData: { [key: string]: unknown } = {
    accounts: {},
    paymentModes: {},
    overdueInvoices: {},
    overdueBills: {},
  };

  constructor(accounts: Record<string, Account>) {
    this.data = {};
    this.accounts = accounts;
  }

  append(fieldName: string, incomingValue: number, currentValue = 0) {
    const incoming = new BigNumber(incomingValue);
    const current = new BigNumber(currentValue);
    const adjustment = incoming.minus(current).dp(2).toNumber();

    this.data = {
      ...this.data,
      [fieldName]: increment(adjustment),
    };
  }

  appendObject(obj: { [key: string]: number | FieldValue }) {
    const { data } = this;
    if (data && typeof data === "object") {
      this.data = { ...data, ...obj };
    } else {
      this.data = obj;
    }
  }

  appendPaymentMode(
    modeId: string,
    incomingValue: number,
    currentValue?: number
  ) {
    this.append(`paymentModes.${modeId}`, incomingValue, currentValue);
  }

  debitPaymentMode(modeId: string, amount: number) {
    this.appendPaymentMode(`${modeId}_debit`, amount);
  }

  creditPaymentMode(modeId: string, amount: number) {
    this.appendPaymentMode(`${modeId}_credit`, amount);
  }

  appendAccount(accountId: string, incomingValue: number, currentValue = 0) {
    this.append(`accounts.${accountId}`, incomingValue, currentValue);
  }

  appendAccountsObject(accounts: { [key: string]: number }) {
    Object.keys(accounts).forEach((accountId) => {
      const amount = accounts[accountId];

      this.appendAccount(accountId, amount);
    });
  }

  creditAccount(accountId: string, amount: number) {
    const { accounts } = this;
    getAccountData(accountId, accounts); //thows error if account not found

    this.appendAccount(`${accountId}_credit`, amount);
  }

  debitAccount(accountId: string, amount: number) {
    const { accounts } = this;

    getAccountData(accountId, accounts); //thows error if account not found

    this.appendAccount(`${accountId}_debit`, amount);
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  static createCreditAmount(accountType: AccountType, amount: number) {
    if (amount < 0) {
      /**
       * debit account instead-assuption -user is updating an account
       * subtract amount from zero(0) to make positive
       */
      SummaryData.createDebitAmount(accountType, 0 - amount);
    }

    const { isCreditOnIncrease } = JournalEntry;

    return isCreditOnIncrease(accountType.main) ? amount : 0 - amount;
  }

  static createDebitAmount(accountType: AccountType, amount: number) {
    if (amount < 0) {
      /**
       * credit account instead-assuption -user is updating an account
       * subtract amount from zero(0) to make positive
       */
      SummaryData.createCreditAmount(accountType, 0 - amount);
    }

    const { isDebitOnIncrease } = JournalEntry;

    return isDebitOnIncrease(accountType.main) ? amount : 0 - amount;
  }
}

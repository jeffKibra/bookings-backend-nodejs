import {
  Transaction,
  WriteBatch,
  getFirestore,
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import {
  AccountType,
  Entry,
  TransactionTypes,
  MappedEntry,
  AccountMapping,
  GroupedEntries,
  Account,
  IContactSummary,
} from "../../types";

import {
  ASSET,
  EQUITY,
  INCOME,
  EXPENSE,
  LIABILITY,
} from "../../constants/ledgers";

import { getDateDetails } from "../dates";

//----------------------------------------------------------------
const db = getFirestore();
const { serverTimestamp } = FieldValue;

type entryFnParams = {
  transactionCollection: string;
  transactionId: string;
  account: Account;
  amount: number;
  transactionType: keyof TransactionTypes;
  contacts: Record<string, IContactSummary>;
};

export default class JournalEntry {
  protected transaction: Transaction | null;
  protected batch: WriteBatch | null;

  userId: string;
  orgId: string;

  constructor(
    firestoreWriteMethods: Transaction | WriteBatch,
    userId: string,
    orgId: string
  ) {
    if (firestoreWriteMethods instanceof Transaction) {
      this.transaction = firestoreWriteMethods;
      this.batch = null;
    } else if (firestoreWriteMethods instanceof WriteBatch) {
      this.batch = firestoreWriteMethods;
      this.transaction = null;
    } else {
      throw new Error(
        "Invalid property firestoreWriteMethods: " + firestoreWriteMethods
      );
    }

    this.userId = userId;
    this.orgId = orgId;
  }

  //------------------------------- -----------------------------
  debitAccount(entryParams: entryFnParams) {
    return this.setEntry(entryParams, "debit");
  }

  //------------------------------------------------------------
  creditAccount(entryParams: entryFnParams) {
    return this.setEntry(entryParams, "credit");
  }

  setEntry(entryParams: entryFnParams, entryType: "credit" | "debit") {
    const {
      account,
      transactionCollection,
      transactionId,
      amount,
      transactionType,
      contacts: rawContacts,
    } = entryParams;
    const { accountId } = account;
    const contacts = rawContacts || {};
    const contactsIds = JournalEntry.generateContactsIds(contacts);
    const contactsArray = Object.values(contacts);

    const { orgId, userId, transaction, batch } = this;

    const entryRef = db
      .collection(transactionCollection)
      .doc(transactionId)
      .collection("journal")
      .doc(accountId);
    const date = getDateDetails();

    const entryData: Entry = {
      amount,
      entryType,
      account,
      transactionId,
      contacts: contactsArray,
      contactsIds,
      status: 0,
      orgId,
      date,
      transactionType,
      createdAt: serverTimestamp() as Timestamp,
      createdBy: userId,
      modifiedAt: serverTimestamp() as Timestamp,
      modifiedBy: userId,
    };

    if (transaction) {
      transaction.set(
        entryRef,
        {
          ...entryData,
        },
        { merge: true }
      );
    } else if (batch) {
      batch.set(
        entryRef,
        {
          ...entryData,
        },
        { merge: true }
      );
    }
  }

  //------------------------------------------------------------
  createEntry(
    transactionCollection: string,
    transactionId: string,
    account: Account,
    amount: number,
    transactionType: keyof TransactionTypes,
    contacts: Record<string, IContactSummary>
  ) {
    const { accountType } = account;
    /**
     * determine whether value is a debit or a credit
     */
    const { credit, debit } = JournalEntry.createDebitAndCredit(
      accountType,
      amount
    );

    const entryAmount = credit || debit;
    const entryType = credit > 0 ? "credit" : "debit";

    return this.setEntry(
      {
        transactionCollection,
        transactionId,
        account,
        amount: entryAmount,
        transactionType,
        contacts,
      },
      entryType
    );
  }

  updateEntry(
    transactionPath: string,
    account: Account,
    amount: number,
    contactsObject?: Record<string, IContactSummary>
  ) {
    const { accountType, accountId } = account;
    const { transaction, batch, userId } = this;

    const contacts = contactsObject || {};
    const contactsArray = Object.values(contacts);
    /**
     * determine whether value is a debit or a credit
     */
    const { credit, debit } = JournalEntry.createDebitAndCredit(
      accountType,
      amount
    );

    // console.log({ accountId, entryId });
    /**
     * update entry
     */
    const entryRef = db.doc(`${transactionPath}/journal/${accountId}`);
    const updateData: Partial<Entry> = {
      amount: credit || debit,
      entryType: credit > 0 ? "credit" : "debit",
      modifiedAt: serverTimestamp() as Timestamp,
      modifiedBy: userId,
      contacts: contactsArray,
    };

    if (transaction) {
      transaction.update(entryRef, { ...updateData });
    } else if (batch) {
      batch.update(entryRef, { ...updateData });
    }
  }

  deleteEntry(
    transactionPath: string,
    accountId: string,
    deletionType: "delete" | "mark" = "mark"
  ) {
    const { transaction, batch, userId } = this;

    const entryRef = db.doc(`${transactionPath}/journal/${accountId}`);

    if (deletionType === "delete") {
      if (transaction) {
        transaction.delete(entryRef);
      } else if (batch) {
        batch.delete(entryRef);
      }
    } else {
      if (transaction) {
        transaction.update(entryRef, {
          status: -1,
          modifiedAt: serverTimestamp(),
          modifiedBy: userId,
        });
      } else if (batch) {
        batch.update(entryRef, {
          status: -1,
          modifiedAt: serverTimestamp(),
          modifiedBy: userId,
        });
      }
    }
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  static async getAccountEntryForTransaction(
    collection: string,
    accountId: string,
    transactionId: string,
    transactionType: keyof TransactionTypes,
    status = "active"
  ): Promise<Entry> {
    console.log({ accountId, transactionId, transactionType, status });

    const snap = await db
      .doc(`${collection}/${transactionId}/journal/${accountId}`)
      .get();

    if (!snap.exists) {
      console.log("errors", {
        accountId,
        transactionId,
        transactionType,
        status,
      });

      throw new Error(
        `Journal Entry not found- transactionId:${transactionId}, accountId:${accountId}!`
      );
    }

    const entry = snap.data() as Entry;

    return entry;
  }

  static async getAccountsEntriesForTransaction(
    orgId: string,
    transactionId: string,
    transactionType: keyof TransactionTypes,
    incomeAccounts: AccountMapping[]
  ) {
    console.log({ incomeAccounts });

    const entries: MappedEntry[] = await Promise.all(
      incomeAccounts.map(async (account) => {
        const { accountId } = account;
        const entryData = await JournalEntry.getAccountEntryForTransaction(
          orgId,
          accountId,
          transactionId,
          transactionType
        );

        return {
          ...account,
          ...entryData,
        };
      })
    );

    return entries;
  }

  static async getTransactionEntries(transactionPath: string) {
    // console.log({ transactionId, orgId, transactionType });

    const snap = await db.doc(transactionPath).collection("journal").get();

    const entries: Entry[] = snap.docs.map((entryDoc) => {
      const entry = entryDoc.data() as Entry;

      return entry;
    });

    return entries;
  }

  groupEntriesBasedOnAccounts(entries: Entry[]) {
    return entries.reduce<GroupedEntries>((groupedEntries, entry) => {
      console.log({ groupedEntries });
      const {
        account: { accountId },
      } = entry;

      const group = groupedEntries[accountId];

      return {
        ...groupedEntries,
        [accountId]: group ? [...group, entry] : [entry],
      };
    }, {});
  }

  static isDebitOnIncrease(main: string) {
    return main === ASSET || main === EXPENSE;
  }

  static isCreditOnIncrease(main: string) {
    return main === LIABILITY || main === EQUITY || main === INCOME;
  }

  static createDebitAndCredit(accountType: AccountType, amount: number) {
    const { main } = accountType;
    const { isCreditOnIncrease, isDebitOnIncrease } = JournalEntry;

    let credit = 0;
    let debit = 0;

    if (amount !== 0) {
      if (isDebitOnIncrease(main)) {
        /**
         * if amount is +ve, debit it
         * else credit it (subtract from zero(0)) to make +ve
         */
        if (amount > 0) {
          debit = amount;
          credit = 0;
        } else {
          debit = 0;
          credit = 0 - amount;
        }
      } else if (isCreditOnIncrease(main)) {
        /**
         * if amount is +ve, credit it
         * else debit it (subtract from zero(0)) to make +ve
         */
        if (amount > 0) {
          credit = amount;
          debit = 0;
        } else {
          credit = 0;
          debit = 0 - amount;
        }
      }
    }

    return { credit, debit };
  }

  static createCredit(accountType: AccountType, amount: number) {
    const { main } = accountType;
    const { isCreditOnIncrease, isDebitOnIncrease } = JournalEntry;

    if (amount <= 0) {
      throw new Error("Value should be greater than zero(0)");
    }

    let credit = 0;

    if (isDebitOnIncrease(main)) {
      /**
       * value should be negative to credit it
       */
      credit = 0 - amount;
    } else if (isCreditOnIncrease(main)) {
      /**
       *value should be positive to credit it
       */
      credit = amount;
    }

    return credit;
  }

  static createDebit(accountType: AccountType, amount: number) {
    const { main } = accountType;
    const { isCreditOnIncrease, isDebitOnIncrease } = JournalEntry;

    if (amount <= 0) {
      throw new Error("Value should be greater than zero(0)");
    }

    let debit = 0;

    if (isDebitOnIncrease(main)) {
      /**
       * value should be positive to debit it
       */
      debit = amount;
    } else if (isCreditOnIncrease(main)) {
      /**
       *value should be negative to debit it
       */
      debit = 0 - amount;
    }

    return debit;
  }

  static getAmountState(amount: number) {
    /**
     * functions returns a string to represent the amount value
     * for easier querying of data
     */
    return amount === 0 ? "zero" : amount > 0 ? "positive" : "negative";
  }

  static getRawAmount(
    accountType: AccountType,
    data: { credit: number; debit: number }
  ) {
    const { main } = accountType;
    const { credit, debit } = data;
    const { isCreditOnIncrease, isDebitOnIncrease } = JournalEntry;

    let amount = 0;

    if (isDebitOnIncrease(main)) {
      /**
       * if debit is greater than zero(0)
       * amount is +ve,
       * else credit is greater than zero(0)
       * amount is -ve
       */
      if (debit > 0) {
        amount = debit;
      } else if (credit > 0) {
        amount = 0 - credit;
      }
    } else if (isCreditOnIncrease(main)) {
      /**
       * if credit is greater than zero(0)
       * amount is +ve,
       * else debit is greater than zero(0)
       * amount is -ve
       */
      if (credit > 0) {
        amount = credit;
      } else if (debit > 0) {
        amount = 0 - debit;
      }
    }

    return amount;
  }

  //------------------------------------------------------------
  static verifyEntryData(data: Entry) {
    const {
      entryType,
      amount,
      account: { accountId },
    } = data;

    const validEntryType = entryType === "credit" || entryType === "debit";

    if (!validEntryType || amount === 0) {
      throw new Error(`Entry data for account ${accountId} is not valid!`);
    }
  }
  //------------------------------------------------------------
  static generateContactsIds(contacts: Record<string, IContactSummary>) {
    if (contacts && typeof contacts === "object") {
      return Object.keys(contacts).map((key) => contacts[key].id);
    } else {
      return [];
    }
  }
  //------------------------------------------------------------
}

import { ClientSession } from 'mongoose';
import { ObjectId } from 'mongodb';
//

//
import { JournalEntryModel } from '../../models';

import {
  IAccountType,
  IJournalEntry,
  TransactionTypes,
  IMappedEntry,
  IAccountMapping,
  IGroupedEntries,
  IAccountSummary,
  IContactSummary,
} from '../../../types';

import {
  ASSET,
  EQUITY,
  INCOME,
  EXPENSE,
  LIABILITY,
} from '../../../constants/ledgers';

//----------------------------------------------------------------

type entryFnParams = {
  transactionId: string;
  account: IAccountSummary;
  amount: number;
  transactionType: keyof TransactionTypes;
  contact?: IContactSummary;
  details?: Record<string, unknown>;
};

export default class JournalEntry {
  protected session: ClientSession | null;

  userId: string;
  orgId: string;

  constructor(session: ClientSession | null, userId: string, orgId: string) {
    if (!session) {
      throw new Error('Invalid property session: ' + session);
    }

    this.session = session;
    this.userId = userId;
    this.orgId = orgId;
  }

  //------------------------------- -----------------------------
  debitAccount(entryParams: entryFnParams) {
    return this.setEntry(entryParams, 'debit');
  }

  //------------------------------------------------------------
  creditAccount(entryParams: entryFnParams) {
    return this.setEntry(entryParams, 'credit');
  }

  generateFindFilters(
    transactionId: string,
    accountId: string,
    // contactId?: string,
    details?: Record<string, unknown>
  ) {
    const { orgId } = this;

    const detailsFilters: Record<string, unknown> = {};

    if (details && typeof details === 'object') {
      Object.keys(details).forEach(detailKey => {
        detailsFilters[`details.${detailKey}`] = details[detailKey];
      });
    }

    return {
      'account.accountId': accountId,
      'metaData.orgId': orgId,
      transactionId,
      // ...(contactId ? { 'contact._id': contactId } : {}),
      ...detailsFilters,
    };
  }

  async setEntry(entryParams: entryFnParams, entryType: 'credit' | 'debit') {
    const {
      account,
      transactionId,
      amount,
      transactionType,
      contact,
      details,
    } = entryParams;

    console.log('set entry account', account);

    const { orgId, userId, session } = this;
    //
    const { accountId } = account;
    // const contactId = contact?._id || '';

    const findFilters = this.generateFindFilters(
      transactionId,
      accountId,
      // contactId,
      details
    );

    const result = await JournalEntryModel.findOneAndUpdate(
      { ...findFilters },
      {
        $set: {
          amount,
          entryType,
          account,
          transactionId,
          contact: contact || {},
          // transactionType,
          ...(details ? { details } : {}),
          metaData: {
            transactionType,
            status: 0,
            orgId,
            createdAt: new Date(),
            createdBy: userId,
            modifiedAt: new Date(),
            modifiedBy: userId,
          },
        },
      },
      { new: true, session, upsert: true }
    );

    const updatedEntry = result as unknown as IJournalEntry;

    return updatedEntry;
  }

  //------------------------------------------------------------
  createEntry(
    transactionId: string,
    account: IAccountSummary,
    amount: number,
    transactionType: keyof TransactionTypes,
    contact: IContactSummary,
    details?: Record<string, unknown>
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
    const entryType = credit > 0 ? 'credit' : 'debit';

    return this.setEntry(
      {
        transactionId,
        account,
        amount: entryAmount,
        transactionType,
        contact,
        details,
      },
      entryType
    );
  }

  updateEntry(
    transactionId: string,
    transactionType: keyof TransactionTypes,
    account: IAccountSummary,
    amount: number,
    contact?: IContactSummary,
    details?: Record<string, unknown>
  ) {
    const { accountType, accountId } = account;
    const { userId } = this;

    /**
     * determine whether value is a debit or a credit
     */
    const { credit, debit } = JournalEntry.createDebitAndCredit(
      accountType,
      amount
    );

    const entryType = credit > 0 ? 'credit' : 'debit';

    // console.log({ accountId, entryId });
    /**
     * update entry
     */

    return this.setEntry(
      {
        account,
        amount: credit || debit,
        contact,
        transactionId,
        transactionType,
        details,
      },
      entryType
    );
  }

  async deleteEntry(
    transactionId: string,
    accountId: string,
    details?: Record<string, unknown>,
    deletionType: 'delete' | 'mark' = 'mark'
  ) {
    const { userId, session } = this;

    const findFilters = this.generateFindFilters(
      transactionId,
      accountId,
      details
    );

    if (deletionType === 'delete') {
      await JournalEntryModel.findOneAndDelete({
        ...findFilters,
      });
    } else {
      await JournalEntryModel.findOneAndUpdate(
        {
          ...findFilters,
        },
        {
          $set: {
            status: -1,
            'metaData.modifiedAt': new Date(),
            'metaData.modifiedBy': userId,
          },
        },
        { session }
      );
    }
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  // static async getAccountEntryForTransaction(
  //   collection: string,
  //   accountId: string,
  //   transactionId: string,
  //   transactionType: keyof TransactionTypes,
  //   status = 'active'
  // ): Promise<Entry> {
  //   console.log({ accountId, transactionId, transactionType, status });

  //   const snap = await db
  //     .doc(`${collection}/${transactionId}/journal/${accountId}`)
  //     .get();

  //   if (!snap.exists) {
  //     console.log('errors', {
  //       accountId,
  //       transactionId,
  //       transactionType,
  //       status,
  //     });

  //     throw new Error(
  //       `Journal Entry not found- transactionId:${transactionId}, accountId:${accountId}!`
  //     );
  //   }

  //   const entry = snap.data() as Entry;

  //   return entry;
  // }

  // static async getAccountsEntriesForTransaction(
  //   orgId: string,
  //   transactionId: string,
  //   transactionType: keyof TransactionTypes,
  //   incomeAccounts: AccountMapping[]
  // ) {
  //   console.log({ incomeAccounts });

  //   const entries: MappedEntry[] = await Promise.all(
  //     incomeAccounts.map(async account => {
  //       const { accountId } = account;
  //       const entryData = await JournalEntry.getAccountEntryForTransaction(
  //         orgId,
  //         accountId,
  //         transactionId,
  //         transactionType
  //       );

  //       return {
  //         ...account,
  //         ...entryData,
  //       };
  //     })
  //   );

  //   return entries;
  // }

  // static async getTransactionEntries(transactionPath: string) {
  //   // console.log({ transactionId, orgId, transactionType });

  //   const snap = await db.doc(transactionPath).collection('journal').get();

  //   const entries: Entry[] = snap.docs.map(entryDoc => {
  //     const entry = entryDoc.data() as Entry;

  //     return entry;
  //   });

  //   return entries;
  // }

  groupEntriesBasedOnAccounts(entries: IJournalEntry[]) {
    return entries.reduce<IGroupedEntries>((groupedEntries, entry) => {
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

  static createDebitAndCredit(accountType: IAccountType, amount: number) {
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

  static createCredit(accountType: IAccountType, amount: number) {
    const { main } = accountType;
    const { isCreditOnIncrease, isDebitOnIncrease } = JournalEntry;

    if (amount <= 0) {
      throw new Error('Value should be greater than zero(0)');
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

  static createDebit(accountType: IAccountType, amount: number) {
    const { main } = accountType;
    const { isCreditOnIncrease, isDebitOnIncrease } = JournalEntry;

    if (amount <= 0) {
      throw new Error('Value should be greater than zero(0)');
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
    return amount === 0 ? 'zero' : amount > 0 ? 'positive' : 'negative';
  }

  static getRawAmount(
    accountType: IAccountType,
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
  static verifyEntryData(data: IJournalEntry) {
    const {
      entryType,
      amount,
      account: { accountId },
    } = data;

    const validEntryType = entryType === 'credit' || entryType === 'debit';

    if (!validEntryType || amount === 0) {
      throw new Error(`Entry data for account ${accountId} is not valid!`);
    }
  }
  //------------------------------------------------------------
  // static generateContactsIds(contact: IContactSummary) {
  //   if (contact && typeof contact === 'object') {
  //     return Object.keys(contact).map(key => contact[key].id);
  //   } else {
  //     return [];
  //   }
  // }
  //------------------------------------------------------------
}

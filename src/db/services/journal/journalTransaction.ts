import {
  ClientSession,
  ModifyResult,
  MongooseBulkWriteOptions,
} from 'mongoose';
import { ObjectId, AnyBulkWriteOperation } from 'mongodb';
//

import JournalEntry, { IEntryFnParams } from './journalEntry';

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
  IJournalEntryType,
} from '../../../types';

import {
  ASSET,
  EQUITY,
  INCOME,
  EXPENSE,
  LIABILITY,
} from '../../../constants/ledgers';

//----------------------------------------------------------------

export default class JournalTransaction {
  protected session: ClientSession | null;
  //

  entries: AnyBulkWriteOperation<Partial<IJournalEntry>>[] = [];
  //
  transactionId: string;
  userId: string;
  orgId: string;
  //

  constructor(
    session: ClientSession | null,
    userId: string,
    orgId: string,
    transactionId: string
  ) {
    if (!session) {
      throw new Error('Invalid property session: ' + session);
    }

    this.session = session;
    this.userId = userId;
    this.orgId = orgId;
    this.transactionId = transactionId;
  }

  //------------------------------------------------------------
  private addToNew(
    entryData: Omit<IJournalEntry, 'metaData'>,
    transactionType: keyof TransactionTypes
  ) {
    const { userId, orgId } = this;

    const metaData: IJournalEntry['metaData'] = {
      transactionType,
      status: 0,
      orgId,
      createdAt: '$$NOW',
      createdBy: userId,
      modifiedAt: '$$NOW',
      modifiedBy: userId,
    };

    return this.entries.push({
      insertOne: {
        document: {
          ...entryData,
          metaData,
        },
      },
    });
  }

  //------------------------------- -----------------------------
  debitAccount(entryParams: IEntryFnParams) {
    const { transactionType } = entryParams;

    const entryData = JournalEntry.generateEntryData(entryParams, 'debit');

    return this.addToNew(entryData, transactionType);
  }

  //------------------------------------------------------------
  creditAccount(entryParams: IEntryFnParams) {
    const { transactionType } = entryParams;

    const entryData = JournalEntry.generateEntryData(entryParams, 'credit');

    return this.addToNew(entryData, transactionType);
  }

  //------------------------------- -----------------------------

  private addToModified(
    entryData: Omit<IJournalEntry, 'metaData'>,
    entryParams: IEntryFnParams
  ) {
    const {
      transactionId,
      entryId,
      account: { accountId },
      contact,
      transactionType,
    } = entryParams;
    //
    const contactId = contact?._id || '';

    const { userId, orgId } = this;

    const filters = JournalEntry.generateFindFilters(
      orgId,
      transactionId,
      entryId,
      accountId,
      contactId
    );

    return this.entries.push({
      updateOne: {
        filter: { ...filters },
        update: {
          $set: {
            ...entryData,
            'metaData.modifiedAt': '$$NOW',
            'metaData.modifiedBy': userId,
          },
        },
      },
    });
  }

  //------------------------------- -----------------------------

  updateAccountDebit(entryParams: IEntryFnParams) {
    const entryData = JournalEntry.generateEntryData(entryParams, 'debit');

    return this.addToModified(entryData, entryParams);
  }

  //------------------------------------------------------------
  updateAccountCredit(entryParams: IEntryFnParams) {
    const entryData = JournalEntry.generateEntryData(entryParams, 'credit');

    return this.addToModified(entryData, entryParams);
  }

  //------------------------------------------------------------
  async commit() {
    const { session, entries } = this;
    const entriesCount = entries.length;

    const writeResult = await JournalEntryModel.bulkWrite([...entries], {
      session: session || undefined,
    });

    const { modifiedCount, insertedCount } = writeResult;

    const allModified = modifiedCount + insertedCount;
    console.log({ modifiedCount, insertedCount, allModified, entriesCount });

    if (allModified !== entriesCount) {
      throw new Error(
        'Error updating journal entries. Some entries not updated!'
      );
    }

    return writeResult;
  }
  //------------------------------------------------------------

  deleteEntry(
    transactionId: string,
    accountId: string,
    entryId: string = '',
    contactId: string = ''
  ) {
    return this.addToDeleted(transactionId, accountId, entryId, contactId);
  }
  //------------------------------- -----------------------------

  private addToDeleted(
    transactionId: string,
    accountId: string,
    entryId: string = '',
    contactId: string = ''
  ) {
    const { userId, orgId } = this;

    const filters = JournalEntry.generateFindFilters(
      orgId,
      transactionId,
      entryId,
      accountId,
      contactId
    );

    //mark entry as deleted
    return this.entries.push({
      updateOne: {
        filter: { ...filters },
        update: {
          $set: {
            amount: 0,
            'metaData.modifiedAt': '$$NOW',
            'metaData.modifiedBy': userId,
            'metaData.status': -1,
          },
        },
      },
    });
  }

  //------------------------------------------------------------

  //------------------------------------------------------------

  //------------------------------------------------------------

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  
  //---------------------------------------------------------------
  

  
}

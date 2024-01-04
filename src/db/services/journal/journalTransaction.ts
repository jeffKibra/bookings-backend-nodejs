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
  IAccountMapping,
  IGroupedEntries,
  IAccountSummary,
  IContactSummary,
  IJournalEntryType,
  IJournalEntryMapping,
  IJournalEntryFormData,
} from '../../../types';

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
  // private addToNew(entryData: IJournalEntryFormData) {
  //   const { userId, orgId, transactionId } = this;

  //   const metaData: IJournalEntry['metaData'] = {
  //     //   transactionType,
  //     status: 0,
  //     orgId,
  //     createdAt: new Date(),
  //     createdBy: userId,
  //     modifiedAt: new Date(),
  //     modifiedBy: userId,
  //   };

  //   return this.entries.push({
  //     insertOne: {
  //       document: {
  //         transactionId,
  //         ...entryData,
  //         metaData,
  //       },
  //     },
  //   });
  // }

  addNewEntry(entryFormData: IJournalEntryFormData) {
    return this.addToModified(entryFormData);
  }

  //------------------------------- -----------------------------
  //   debitAccount(entryFormData: IJournalEntryFormData) {
  //     const { transactionType } = entryFormData;

  //     const entryData = JournalEntry.generateEntryData(entryFormData, 'debit');

  //     return this.addToNew(entryData, transactionType);
  //   }

  //   //------------------------------------------------------------
  //   creditAccount(entryFormData: IJournalEntryFormData) {
  //     const { transactionType } = entryFormData;

  //     const entryData = JournalEntry.generateEntryData(entryFormData, 'credit');

  //     return this.addToNew(entryData, transactionType);
  //   }

  //------------------------------- -----------------------------

  private addToModified(entryData: IJournalEntryFormData) {
    //

    const { userId, orgId, transactionId } = this;

    const {
      entryId,
      account: { accountId },
      contact,
    } = entryData;
    const contactId = contact?._id || '';

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
          $setOnInsert: {
            'metaData.createdAt': new Date(),
            'metaData.createdBy': userId,
            orgId,
          },
          $set: {
            transactionId,
            ...entryData,
            'metaData.modifiedAt': new Date(),
            'metaData.modifiedBy': userId,
            'metaData.status': 0,
          },
        },
        upsert: true,
      },
    });
  }

  //------------------------------- -----------------------------
  updateEntry(entryData: IJournalEntryFormData) {
    return this.addToModified(entryData);
  }
  //------------------------------- -----------------------------

  //   updateAccountDebit(entryParams: IEntryFnParams) {
  //     const entryData = JournalEntry.generateEntryData(entryParams, 'debit');

  //     return this.addToModified(entryData, entryParams);
  //   }

  //   //------------------------------------------------------------
  //   updateAccountCredit(entryParams: IEntryFnParams) {
  //     const entryData = JournalEntry.generateEntryData(entryParams, 'credit');

  //     return this.addToModified(entryData, entryParams);
  //   }

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

    /**
     * mark entry as deleted
     * set amount to zero(0)
     * set metaData.status to -1
     */
    return this.entries.push({
      updateOne: {
        filter: { ...filters },
        update: {
          $set: {
            amount: 0,
            'metaData.modifiedAt': new Date(),
            'metaData.modifiedBy': userId,
            'metaData.status': -1,
          },
        },
      },
    });
  }

  //------------------------------------------------------------
  async commit() {
    const { session, entries } = this;
    const entriesCount = entries.length;

    console.log('entries', entries);

    const writeResult = await JournalEntryModel.bulkWrite([...entries], {
      session: session || undefined,
    });

    console.log('write result', writeResult);

    const { modifiedCount, insertedCount, upsertedCount } = writeResult;

    const allModified = modifiedCount + insertedCount + upsertedCount;
    console.log({
      modifiedCount,
      insertedCount,
      upsertedCount,
      allModified,
      entriesCount,
    });

    if (allModified !== entriesCount) {
      throw new Error(
        'Error updating journal entries. Some entries not updated!'
      );
    }

    return writeResult;
  }

  //------------------------------------------------------------

  //------------------------------------------------------------

  //------------------------------------------------------------

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  //---------------------------------------------------------------
}

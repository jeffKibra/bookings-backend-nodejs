import { ClientSession } from 'mongodb';
//
import JournalTransaction from './journalTransaction';
//
import { IJournalEntryFormData } from '../../../types';

interface IPayload {
  userId: string;
  orgId: string;
  transactionId: string;
}

export default class TxJournalEntries extends JournalTransaction {
  // entriesToDelete: IJournalEntryMapping[] = [];
  // entriesToUpdate: IJournalEntryMapping[] = [];
  // entriesToCreate: IJournalEntryMapping[] = [];
  // similarEntries: IJournalEntryMapping[] = [];
  //
  currentEntriesObject: Record<string, IJournalEntryFormData> = {};

  /**
   * Always append current entries before incoming entries to calculate
   * differences for correct updates
   * @param session
   * @param payload
   */
  constructor(session: ClientSession | null, payload: IPayload) {
    const { userId, orgId, transactionId } = payload;

    super(session, userId, orgId, transactionId);

    // const currentEntriesObject =
    //   TxJournalEntries.convertEntriesDataArrayToObject(currentTxEntriesData);

    // console.log('current entries object', currentEntriesObject);
    // this.currentEntriesObject = currentEntriesObject;
  }

  // appendCurrentExcess(amount: number) {
  //   const allocation = TxJournalEntries.generateExcessAllocation(amount);

  //   this.appendCurrentEntry(allocation);
  // }

  appendCurrentEntry(allocation: IJournalEntryFormData) {
    const {
      entryId,
      account: { accountId },
      amount,
      contact,
    } = allocation;

    const entryRef = TxJournalEntries.createEntryRef(
      accountId,
      entryId,
      contact?._id
    );

    if (amount < 0) {
      //cant have negative values
      TxJournalEntries.throwPositiveNumberError(entryRef);
    }

    this.currentEntriesObject[entryRef] = allocation;
  }

  // appendIncomingExcess(amount: number) {
  //   const allocation = TxJournalEntries.generateExcessAllocation(amount);

  //   this.appendIncomingAllocation(allocation);
  // }

  appendIncomingEntry(entryData: IJournalEntryFormData) {
    const { amount: incoming, account, entryId, contact } = entryData;

    const { accountId } = account;

    const entryRef = TxJournalEntries.createEntryRef(
      accountId,
      entryId,
      contact?._id
    );

    const { currentEntriesObject } = this;

    const current = currentEntriesObject[entryRef]?.amount || 0;

    if (incoming < 0 || current < 0) {
      //cant have negative values
      TxJournalEntries.throwPositiveNumberError(entryRef);
    }

    // const dataMapping: IJournalEntryMapping = {
    //   incoming,
    //   current,
    //   account,
    //   entryId,
    //   contact,
    //   entryRef,
    //   transactionType,
    //   entryType,
    // };

    if (incoming > 0 && current === 0) {
      /**
       * booking not in current payments
       * add it to entryDatasToCreate
       */
      this.addNewEntry(entryData);
      // this.entriesToCreate.push(dataMapping);
    } else {
      /**
       * similar booking has been found-check if the amounts are equal
       * if equal, add to similars array-else add to entriesToUpdate array
       */
      if (incoming === current) {
        // this.similarEntries.push(dataMapping);
        console.log('unchanged entry found: ', entryData);
      } else {
        this.updateEntry(entryData);
        // this.entriesToUpdate.push(dataMapping);
      }

      /**
       * current invoice payment has been processed.
       * delete from list to avoid duplicates
       */

      this.deleteCurrentEntryData(entryRef);
    }

    return {
      current,
      incoming,
    };
  }

  private deleteCurrentEntryData(entryRef: string) {
    try {
      delete this.currentEntriesObject[entryRef];
    } catch (error) {
      console.warn(`Error deleting current allocation. entryRef: ${entryRef}`);
      console.error(error);
    }
  }

  updateEntries() {
    const { currentEntriesObject, transactionId } = this;

    //
    if (!currentEntriesObject) {
      throw new Error('Invalid current entries object!');
    }

    /**
     * mark any remaining current entries for deletion
     */
    Object.keys(currentEntriesObject).forEach(entryRef => {
      const entryData = currentEntriesObject[entryRef];
      const {
        account: { accountId },
        entryId,
        contact,
      } = entryData;
      const contactId = contact?._id || '';

      // const dataMapping: IJournalEntryMapping = {
      //   current: amount,
      //   incoming: 0,
      //   transactionType,
      //   account,
      //   entryId,
      //   contact,
      //   entryRef,
      //   entryType,
      // };

      this.deleteEntry(transactionId, accountId, entryId, contactId);

      // this.entriesToDelete.push(dataMapping);

      /**
       * incoming invoice payment has been processed.
       * delete from list to avoid duplicates
       */
      this.deleteCurrentEntryData(entryRef);
    });

    return this.commit();
  }

  //--------------------------------------------------------------------
  //STATIC METHODS
  //--------------------------------------------------------------------

  static throwPositiveNumberError(entryRef: string) {
    throw new Error(
      `Only positive numbers for entry amount are allowed! entryRef: ${entryRef}`
    );
  }

  //-------------------------------------------------------------------

  //-------------------------------------------------------------------
  static convertEntriesDataArrayToObject(entries?: IJournalEntryFormData[]) {
    const entriesObject: Record<string, IJournalEntryFormData> = {};

    if (Array.isArray(entries)) {
      entries.forEach(allocation => {
        const {
          entryId,
          account: { accountId },
          contact,
          amount,
        } = allocation;

        const entryRef = this.createEntryRef(accountId, entryId, contact?._id);

        if (amount < 0) {
          //cant have negative values
          TxJournalEntries.throwPositiveNumberError(entryRef);
        }

        entriesObject[entryRef] = allocation;
      });
    }

    return entriesObject;
  }

  //-------------------------------------------------------------------

  static createEntryRef(
    accountId: string,
    entryId: string = '',
    contactId: string = ''
  ) {
    const secondField = entryId ? `_${entryId}` : '';
    const thirdField = contactId ? `_${contactId}` : '';

    return `${accountId}${secondField}${thirdField}`;
  }
}

// import {
//   IJournalEntryFormData,
//   IJournalEntryMapping,
//   IJournalEntryMappingResult,
// } from '../../../types';

// export default class JournalEntriesMapping {
//   entriesToDelete: IJournalEntryMapping[] = [];
//   entriesToUpdate: IJournalEntryMapping[] = [];
//   entriesToCreate: IJournalEntryMapping[] = [];
//   similarEntries: IJournalEntryMapping[] = [];
//   //
//   currentEntriesObject: Record<string, IJournalEntryFormData>;

//   constructor(currentTxEntriesData?: IJournalEntryFormData[]) {
//     const currentEntriesObject =
//       JournalEntriesMapping.convertEntriesDataArrayToObject(
//         currentTxEntriesData
//       );

//     console.log('current entries object', currentEntriesObject);
//     this.currentEntriesObject = currentEntriesObject;
//   }

//   // appendCurrentExcess(amount: number) {
//   //   const allocation = JournalEntriesMapping.generateExcessAllocation(amount);

//   //   this.appendCurrentEntry(allocation);
//   // }

//   appendCurrentEntry(allocation: IJournalEntryFormData) {
//     const {
//       entryId,
//       account: { accountId },
//       amount,
//       contact,
//     } = allocation;

//     const entryRef = JournalEntriesMapping.createEntryRef(
//       accountId,
//       entryId,
//       contact?._id
//     );

//     if (amount < 0) {
//       //cant have negative values
//       JournalEntriesMapping.throwPositiveNumberError(entryRef);
//     }

//     this.currentEntriesObject[entryRef] = allocation;
//   }

//   // appendIncomingExcess(amount: number) {
//   //   const allocation = JournalEntriesMapping.generateExcessAllocation(amount);

//   //   this.appendIncomingAllocation(allocation);
//   // }

//   appendIncomingEntry(entryData: IJournalEntryFormData) {
//     const {
//       amount: incoming,
//       transactionType,
//       account,
//       entryId,
//       contact,
//     } = entryData;

//     const { accountId } = account;

//     const entryRef = JournalEntriesMapping.createEntryRef(
//       accountId,
//       entryId,
//       contact?._id
//     );

//     const { currentEntriesObject } = this;

//     const current = currentEntriesObject[entryRef]?.amount || 0;

//     if (incoming < 0 || current < 0) {
//       //cant have negative values
//       JournalEntriesMapping.throwPositiveNumberError(entryRef);
//     }

//     const dataMapping: IJournalEntryMapping = {
//       incoming,
//       current,
//       transactionType,
//       account,
//       entryId,
//       contact,
//       entryRef,
//     };

//     if (incoming > 0 && current === 0) {
//       /**
//        * booking not in current payments
//        * add it to entryDatasToCreate
//        */
//       this.entriesToCreate.push(dataMapping);
//     } else {
//       /**
//        * similar booking has been found-check if the amounts are equal
//        * if equal, add to similars array-else add to entriesToUpdate array
//        */
//       if (incoming === current) {
//         this.similarEntries.push(dataMapping);
//       } else {
//         this.entriesToUpdate.push(dataMapping);
//       }
//       /**
//        * current invoice payment has been processed.
//        * delete from list to avoid duplicates
//        */

//       this.deleteCurrentEntryData(entryRef);
//     }

//     return dataMapping;
//   }

//   private deleteCurrentEntryData(entryRef: string) {
//     try {
//       delete this.currentEntriesObject[entryRef];
//     } catch (error) {
//       console.warn(`Error deleting current allocation. entryRef: ${entryRef}`);
//       console.error(error);
//     }
//   }

//   generateMapping(): IJournalEntryMappingResult {
//     const { currentEntriesObject } = this;

//     //
//     if (!currentEntriesObject) {
//       throw new Error('Invalid current entries object!');
//     }

//     /**
//      * mark any remaining current entries for deletion
//      */
//     Object.keys(currentEntriesObject).forEach(entryRef => {
//       const allocation = currentEntriesObject[entryRef];
//       const { transactionType, amount, account, entryId, contact } = allocation;

//       const dataMapping: IJournalEntryMapping = {
//         current: amount,
//         incoming: 0,
//         transactionType,
//         account,
//         entryId,
//         contact,
//         entryRef,
//       };

//       this.entriesToDelete.push(dataMapping);

//       /**
//        * incoming invoice payment has been processed.
//        * delete from list to avoid duplicates
//        */
//       this.deleteCurrentEntryData(entryRef);
//     });

//     const {
//       entriesToCreate,
//       entriesToUpdate,
//       entriesToDelete,
//       similarEntries,
//     } = this;

//     console.log('entries to create', entriesToCreate);
//     console.log('entries to update', entriesToUpdate);
//     console.log('entries to delete', entriesToDelete);
//     console.log('similar entries', similarEntries);

//     const uniqueEntries = [
//       ...entriesToCreate,
//       ...entriesToUpdate,
//       ...entriesToDelete,
//       ...similarEntries,
//     ];

//     return {
//       uniqueEntries,
//       similarEntries,
//       entriesToCreate,
//       entriesToUpdate,
//       entriesToDelete,
//     };
//   }

//   //--------------------------------------------------------------------
//   //STATIC METHODS
//   //--------------------------------------------------------------------

//   static throwPositiveNumberError(entryRef: string) {
//     throw new Error(
//       `Only positive numbers for entry amount are allowed! entryRef: ${entryRef}`
//     );
//   }

//   //-------------------------------------------------------------------

//   //-------------------------------------------------------------------
//   static convertEntriesDataArrayToObject(entries?: IJournalEntryFormData[]) {
//     const entriesObject: Record<string, IJournalEntryFormData> = {};

//     if (Array.isArray(entries)) {
//       entries.forEach(allocation => {
//         const {
//           entryId,
//           account: { accountId },
//           contact,
//           amount,
//         } = allocation;

//         const entryRef = this.createEntryRef(accountId, entryId, contact?._id);

//         if (amount < 0) {
//           //cant have negative values
//           JournalEntriesMapping.throwPositiveNumberError(entryRef);
//         }

//         entriesObject[entryRef] = allocation;
//       });
//     }

//     return entriesObject;
//   }

//   //-------------------------------------------------------------------

//   static createEntryRef(
//     accountId: string,
//     entryId: string = '',
//     contactId: string = ''
//   ) {
//     const secondField = entryId ? `_${entryId}` : '';
//     const thirdField = contactId ? `_${contactId}` : '';

//     return `${accountId}${secondField}${thirdField}`;
//   }
// }

function pipin() {}

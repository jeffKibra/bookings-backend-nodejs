// import { ClientSession, ModifyResult } from 'mongoose';
// import { ObjectId } from 'mongodb';
// //

// import JournalEntry, { IEntryFnParams } from './journalEntry';

// //
// import { JournalTransactionModel } from '../../../models';

// import {
//   IAccountType,
//   IJournalEntry,
//   TransactionTypes,
//   IMappedEntry,
//   IAccountMapping,
//   IGroupedEntries,
//   IAccountSummary,
//   IContactSummary,
//   IJournalEntryTransactionId,
//   IJournalEntryActionType,
//   IJournalEntryInitPayload,
//   IJournalTx,
//   IJournalEntryType,
// } from '../../../../types';

// import {
//   ASSET,
//   EQUITY,
//   INCOME,
//   EXPENSE,
//   LIABILITY,
// } from '../../../../constants/ledgers';

// //----------------------------------------------------------------

// export default class JournalTransaction {
//   protected session: ClientSession | null;
//   protected action: IJournalEntryActionType;
//   //

//   toCreate: IJournalEntry[] = [];
//   toUpdate: IJournalEntry[] = [];
//   toDelete: unknown[] = [];

//   transactionId: string;
//   userId: string;
//   orgId: string;
//   //

//   constructor(
//     session: ClientSession | null,
//     payload: IJournalEntryInitPayload
//   ) {
//     if (!session) {
//       throw new Error('Invalid property session: ' + session);
//     }
//     if (!payload) {
//       throw new Error('Invalid property payload: ' + JSON.stringify(payload));
//     }

//     const { userId, orgId, transactionId, action } = payload;

//     this.session = session;
//     this.userId = userId;
//     this.orgId = orgId;
//     this.transactionId = transactionId;
//     //
//     this.action = action;
//   }

//   //------------------------------- -----------------------------
//   debitAccount(entryParams: IEntryFnParams) {
//     const entryData = JournalEntry.generateEntryData(entryParams, 'debit');

//     this.toCreate.push(entryData);
//   }

//   //------------------------------------------------------------
//   creditAccount(entryParams: IEntryFnParams) {
//     const entryData = JournalEntry.generateEntryData(entryParams, 'credit');
//     this.toCreate.push(entryData);
//   }

//   //------------------------------- -----------------------------
//   updateAccountDebit(entryParams: IEntryFnParams) {
//     const entryData = JournalEntry.generateEntryData(entryParams, 'debit');

//     this.toUpdate.push(entryData);
//   }

//   //------------------------------------------------------------
//   updateAccountCredit(entryParams: IEntryFnParams) {
//     const entryData = JournalEntry.generateEntryData(entryParams, 'credit');

//     this.toUpdate.push(entryData);
//   }

//   //------------------------------------------------------------
//   async create() {
//     const { session, toCreate, transactionId, userId, orgId } = this;

//     const instance = new JournalTransactionModel({
//       _id: new Object(transactionId),
//       entries: toCreate,
//       metaData: {
//         createdAt: new Date(),
//         createdBy: userId,
//         modifiedAt: new Date(),
//         modifiedBy: userId,
//         orgId,
//         status: 0,
//       },
//     });

//     const result = await instance.save({ session });

//     return result;
//   }
//   //------------------------------------------------------------

//   async update() {
//     const { session, toCreate, toUpdate, transactionId, userId, orgId } = this;

//     JournalTransactionModel.findByIdAndUpdate(
//       transactionId,
//       {
//         $set: {
//           'metaData.modifiedAt': new Date(),
//           'metaData.modifiedBy': userId,
//         },
//       },
//       { session }
//     );
//   }

//   //------------------------------------------------------------

//   //------------------------------------------------------------

//   //------------------------------------------------------------

//   //----------------------------------------------------------------
//   //static methods
//   //----------------------------------------------------------------

//   groupEntriesBasedOnAccounts(entries: IJournalEntry[]) {
//     return entries.reduce<IGroupedEntries>((groupedEntries, entry) => {
//       console.log({ groupedEntries });
//       const {
//         account: { accountId },
//       } = entry;

//       const group = groupedEntries[accountId];

//       return {
//         ...groupedEntries,
//         [accountId]: group ? [...group, entry] : [entry],
//       };
//     }, {});
//   }

//   //---------------------------------------------------------------
//   static verifyWrite(result?: ModifyResult<unknown> | null) {
//     const isModified =
//       result &&
//       (result.lastErrorObject?.updatedExisting ||
//         result.lastErrorObject?.upserted);

//     if (!isModified) {
//       throw new Error('One journal entry not updated!');
//     }

//     // const doc = result.value;

//     // return doc;
//   }

//   static isDebitOnIncrease(main: string) {
//     return main === ASSET || main === EXPENSE;
//   }

//   static isCreditOnIncrease(main: string) {
//     return main === LIABILITY || main === EQUITY || main === INCOME;
//   }
// }

function placeholder() {}

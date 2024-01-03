import { ClientSession } from 'mongodb';
//
import { Accounts } from '../../accounts';
//
import { getAccountsMapping } from '../../utils/accounts';
import { JournalEntry } from '../../journal';
import SaleJournal from './saleJournal';
// import BigNumber from 'bignumber.js';

import {
  IAccountsMapping,
  IAccountMapping,
  IAccountSummary,
  SaleTransactionTypes,
  IContactSummary,
  IContact,
  ISaleForm,
  ISaleItem,
  ISaleType,
  IJournalEntry,
} from '../../../../types';
import { constant } from 'lodash';

type TransactionType = keyof SaleTransactionTypes;

//----------------------------------------------------------------

interface SaleDetails {
  transactionId: string;
  userId: string;
  orgId: string;
  transactionType: TransactionType;
  saleType: ISaleType;
}

export interface SaleDataAndAccount {
  saleDetails: ISaleForm;
  debitAccount: IAccountSummary;
}

interface SummaryObject {
  [key: string]: number;
}

interface CustomerSummaryData {
  saleDetails: ISaleForm;
  summary: SummaryObject;
}
interface CustomerChangeData {
  saleDetails: ISaleForm;
  extraSummaryData: Record<string, number>;
}

//------------------------------------------------------------

export default class Sale {
  protected session: ClientSession | null;

  transactionId: string;
  orgId: string;
  userId: string;
  transactionType: TransactionType;
  saleType: ISaleType;

  // ARAccount: Account;
  // UFAccount: Account;

  constructor(session: ClientSession | null, saleDetails: SaleDetails) {
    const { orgId, userId, transactionId, transactionType, saleType } =
      saleDetails;

    // super(session, orgId);

    this.session = session;

    this.transactionId = transactionId;
    this.userId = userId;
    this.orgId = orgId;
    this.transactionType = transactionType;
    this.saleType = saleType;

    //

    // this.ARAccount = getAccountData('accounts_receivable', accounts);
    // this.UFAccount = getAccountData('undeposited_funds', accounts);
  }

  //writing methods

  async updateSaleJournal(
    incomingSale: ISaleForm | null,
    currentSale?: ISaleForm
  ) {
    const { orgId, saleType, session, transactionId, transactionType, userId } =
      this;

    const saleJournalInstance = new SaleJournal(session, {
      orgId,
      saleType,
      transactionId,
      transactionType,
      userId,
    });

    if (currentSale) {
      console.log('appending current sale...');

      await saleJournalInstance.appendCurrentSale(currentSale);

      console.log('finished appending current sale');
    }

    if (incomingSale) {
      console.log('appending incoming sale...');

      await saleJournalInstance.appendIncomingSale(incomingSale);

      console.log('finished appending incoming sale');
    }

    const result = await saleJournalInstance.updateEntries();

    return result;
  }

  //----------------------------------------------------------------

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  //----------------------------------------------------------------

  //----------------------------------------------------------------

  //------------------------------------------------------------

  //------------------------------------------------------------

  //------------------------------------------------------------

  //------------------------------------------------------------
  static createContactFromCustomer(
    customer?: IContactSummary | IContact | null
  ) {
    let contact: IContactSummary = {
      _id: '',
      displayName: '',
    };

    if (customer) {
      const { _id, displayName } = customer;
      contact = {
        _id,
        displayName,
      };
    }

    return contact;
  }
}

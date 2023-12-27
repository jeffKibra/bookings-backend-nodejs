import { ClientSession } from 'mongodb';
//
import { Accounts } from '../../accounts';
//
import { getAccountsMapping } from '../../utils/accounts';
import { JournalEntry } from '../../journal';
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

export default class Sale extends Accounts {
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

    super(session, orgId);

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

  async createJournalEntries(
    newAccounts: IAccountMapping[],
    incomingSale: ISaleForm,
    entriesType: 'debit' | 'credit'
  ) {
    const { session, userId, orgId, transactionId } = this;

    console.log('creating entries', newAccounts, { transactionId });

    const journal = new JournalEntry(session, userId, orgId);
    const contact = Sale.createContactFromCustomer(incomingSale.customer);

    const result = await Promise.all(
      newAccounts.map(mappedAccount =>
        this.setJournalEntry(mappedAccount, contact, journal, entriesType)
      )
    );

    return result;
  }

  async updateJournalEntries(
    accountsMapping: IAccountsMapping,
    incomingSale: ISaleForm,
    entriesType: 'debit' | 'credit'
  ) {
    const { session, userId, orgId } = this;

    const { similarAccounts, updatedAccounts } = accountsMapping;
    const accountsToUpdate = [...similarAccounts, ...updatedAccounts];

    const contact = Sale.createContactFromCustomer(incomingSale.customer);

    const journal = new JournalEntry(session, userId, orgId);

    const result = await Promise.all(
      accountsToUpdate.map(data =>
        this.setJournalEntry(data, contact, journal, entriesType)
      )
    );

    return result;
  }

  //----------------------------------------------------------------
  async setJournalEntry(
    accountToSet: IAccountMapping,
    contact: IContactSummary,
    journalInstance: JournalEntry,
    entriesType: 'debit' | 'credit'
  ) {
    const { transactionId, transactionType } = this;

    const { accountId, incoming } = accountToSet;

    const account = await this.getAccountData(accountId);
    console.log('setting journal entry,', { accountId, account });

    let result: IJournalEntry;

    if (entriesType === 'credit') {
      result = await journalInstance.creditAccount({
        account,
        amount: incoming,
        transactionId: { primary: transactionId },
        transactionType,
        contact,
      });
    } else if (entriesType === 'debit') {
      result = await journalInstance.debitAccount({
        account,
        amount: incoming,
        transactionId: { primary: transactionId },
        transactionType,
        contact,
      });
    } else {
      throw new Error(
        `Invalid entries type: ${entriesType} for account: ${accountId} `
      );
    }

    return result;
  }

  async deleteJournalEntries(deletedAccounts: IAccountMapping[]) {
    const { session, userId, orgId, transactionId } = this;

    const journal = new JournalEntry(session, userId, orgId);
    const result = await Promise.all(
      deletedAccounts.map(({ accountId }) =>
        journal.deleteEntry({ primary: transactionId }, accountId)
      )
    );

    return result;
  }

  protected initCreateSale(incomingSale: ISaleForm) {
    return this.generateAccountsMapping(incomingSale);
  }

  protected generateAccountsMapping(
    incomingSale: ISaleForm | null,
    currentSale?: ISaleForm
  ) {
    const creditAccountsMapping = Sale.generateCreditAccounts(
      incomingSale,
      currentSale
    );
    const debitAccountsMapping = Sale.generateDebitAccounts(
      incomingSale,
      currentSale
    );

    return {
      creditAccountsMapping,
      debitAccountsMapping,
    };
  }

  protected async createSale(
    incomingSale: ISaleForm,
    creditAccountsMapping: IAccountsMapping,
    debitAccountsMapping: IAccountsMapping
  ) {
    await Promise.all([
      this.createJournalEntries(
        creditAccountsMapping.newAccounts,
        incomingSale,
        'credit'
      ),
      this.createJournalEntries(
        debitAccountsMapping.newAccounts,
        incomingSale,
        'debit'
      ),
    ]);
  }

  protected async updateSale(
    incomingSale: ISaleForm,
    currentSale: ISaleForm,
    creditAccountsMapping: IAccountsMapping,
    debitAccountsMapping: IAccountsMapping
  ) {
    await Promise.all([
      //create journal entries

      this.createJournalEntries(
        creditAccountsMapping.newAccounts,
        incomingSale,
        'credit'
      ),
      this.createJournalEntries(
        debitAccountsMapping.newAccounts,
        incomingSale,
        'debit'
      ),
      //update journal entries
      this.updateJournalEntries(creditAccountsMapping, incomingSale, 'credit'),
      this.updateJournalEntries(debitAccountsMapping, incomingSale, 'debit'),
      //delete journal entries
      this.deleteJournalEntries(creditAccountsMapping.deletedAccounts),
      this.deleteJournalEntries(debitAccountsMapping.deletedAccounts),
    ]);
  }

  protected async deleteSale(
    currentSale: ISaleForm,
    creditDeletedAccounts: IAccountMapping[],
    debitDeletedAccounts: IAccountMapping[]
  ) {
    await Promise.all([
      this.deleteJournalEntries(creditDeletedAccounts),
      this.deleteJournalEntries(debitDeletedAccounts),
    ]);
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------
  static generateCreditAccounts(
    incomingSale: ISaleForm | null,
    currentSale?: ISaleForm
  ) {
    if (!incomingSale && !currentSale) {
      throw new Error(
        'Please provide atleast either the current or the incoming sale data'
      );
    }

    const currentSaleItems = currentSale?.items;
    const currentAccounts =
      currentSale && currentSaleItems
        ? [
            ...Sale.getItemsAccounts(currentSaleItems),
            // {
            //   accountId: "shipping_charge",
            //   amount: currentSummary.shipping || 0,
            // },
            // {
            //   accountId: "other_charges",
            //   amount: currentSummary.adjustment || 0,
            // },
            //uncomment when tax calculation is enabled
            // { accountId: "tax_payable", amount: currentSummary.totalTax || 0 },
          ]
        : [];

    const incomingSaleItems = incomingSale?.items;
    const incomingAccounts =
      incomingSale && incomingSaleItems
        ? [
            ...Sale.getItemsAccounts(incomingSaleItems),

            // {
            //   accountId: "shipping_charge",
            //   amount: incomingSummary.shipping || 0,
            // },
            // {
            //   accountId: "other_charges",
            //   amount: incomingSummary.adjustment || 0,
            // },
            //uncomment when tax calculation is enabled
            // {
            //   accountId: "tax_payable",
            //   amount: incomingSummary.totalTax || 0,
            // },
          ]
        : [];

    const accountsMapping = getAccountsMapping(
      currentAccounts,
      incomingAccounts
    );

    return accountsMapping;
  }

  //----------------------------------------------------------------
  static generateDebitAccounts(
    incomingSale: ISaleForm | null,
    currentSale?: ISaleForm
  ) {
    if (!incomingSale && !currentSale) {
      throw new Error(
        'Please provide atleast either the current or the incoming sale data'
      );
    }

    const currentTotal = currentSale?.total || 0;
    const currentAccounts = currentSale
      ? [
          {
            accountId: 'accounts_receivable',
            amount: currentTotal,
          },
          // {
          //   accountId: 'undeposited_funds',
          //   amount: currentDownPayment,
          // },
        ]
      : [];

    const incomingTotal = incomingSale?.total || 0;
    const incomingAccounts = incomingSale
      ? [
          {
            accountId: 'accounts_receivable',
            amount: incomingTotal,
          },
          // {
          //   accountId: 'undeposited_funds',
          //   amount: incomingDownPayment,
          // },
        ]
      : [];

    const accountsMapping = getAccountsMapping(
      currentAccounts,
      incomingAccounts
    );

    return accountsMapping;
  }

  //----------------------------------------------------------------

  //------------------------------------------------------------

  //------------------------------------------------------------
  // static async getSaleDataWithTransaction(
  //   transaction: Transaction,
  //   collectionPath: string,
  //   transactionId: string
  // ) {
  //   const saleRef = db.collection(collectionPath).doc(transactionId);
  //   const snap = await transaction.get(saleRef);

  //   return Sale.retrieveSaleData(transactionId, snap);
  // }

  //------------------------------------------------------------
  // static async getSaleData(collectionPath: string, transactionId: string) {
  //   const saleRef = db.collection(collectionPath).doc(transactionId);
  //   const snap = await saleRef.get();

  //   return Sale.retrieveSaleData(transactionId, snap);
  // }

  //------------------------------------------------------------

  // static retrieveSaleData(transactionId: string, snap: DocumentSnapshot) {
  //   const data = snap.data();

  //   if (
  //     !snap.exists ||
  //     snap.data()?.status === 'deleted' ||
  //     data === undefined
  //   ) {
  //     throw new Error(`Sale with id ${transactionId} not found!`);
  //   }

  //   return { ...data, id: snap.id };
  // }

  //------------------------------------------------------------
  static getItemsAccounts(items: ISaleItem[]) {
    return items.map(saleItem => {
      const { total, salesAccountId } = saleItem;

      return { accountId: salesAccountId, amount: total };
    });
  }
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

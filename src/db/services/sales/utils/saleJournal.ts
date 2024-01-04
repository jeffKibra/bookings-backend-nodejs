import { ClientSession } from 'mongodb';
//
import { Accounts } from '../../accounts';
import { TxJournalEntries } from '../../journal';
//
// import BigNumber from 'bignumber.js';

import {
  IAccountSummary,
  SaleTransactionTypes,
  IContactSummary,
  IContact,
  ISaleForm,
  ISaleItem,
  ISaleType,
} from '../../../../types';

type ITransactionType = keyof SaleTransactionTypes;

//----------------------------------------------------------------

interface SaleDetails {
  transactionId: string;
  userId: string;
  orgId: string;
  transactionType: ITransactionType;
  saleType: ISaleType;
}

export interface SaleDataAndAccount {
  saleDetails: ISaleForm;
  debitAccount: IAccountSummary;
}

//------------------------------------------------------------
const { AR: ARAccountId } = Accounts.commonIds;
//------------------------------------------------------------

export default class SaleJournal extends TxJournalEntries {
  protected session: ClientSession | null;

  transactionId: string;
  orgId: string;
  userId: string;
  transactionType: ITransactionType;
  saleType: ISaleType;
  //
  accountsInstance: Accounts;

  constructor(session: ClientSession | null, saleDetails: SaleDetails) {
    const { orgId, userId, transactionId, transactionType, saleType } =
      saleDetails;

    super(session, {
      orgId,
      userId,
      transactionId,
    });

    this.session = session;

    this.transactionId = transactionId;
    this.userId = userId;
    this.orgId = orgId;
    this.transactionType = transactionType;
    this.saleType = saleType;

    this.accountsInstance = new Accounts(session, orgId);
  }

  //----------------------------------------------------------------
  //----------------------------------------------------------------

  async appendCurrentSale(currentSale: ISaleForm) {
    if (!currentSale) {
      throw new Error('Please provide atleast either the current sale data');
    }

    const { items, customer, total } = currentSale;
    const contact = SaleJournal.createContactFromCustomer(customer);

    const currentItemsAccounts = SaleJournal.groupItemsIntoAccounts(
      items || []
    );

    const { accountsInstance, transactionType } = this;
    /**
     * loop through items income accounts.
     * credit each account
     */
    const [ARAccount] = await Promise.all([
      accountsInstance.getAccountData(ARAccountId),
      ...Object.keys(currentItemsAccounts).map(async accountId => {
        const account = await accountsInstance.getAccountData(accountId);

        const amount = currentItemsAccounts[accountId];

        /**
         * credit income accounts
         */
        this.appendCurrentEntry({
          account,
          amount,
          entryId: '',
          entryType: 'credit',
          transactionType,
          contact,
        });
      }),
    ]);

    /**
     * debit accounts_receivable account
     */
    this.appendCurrentEntry({
      account: ARAccount,
      amount: total,
      entryId: '',
      entryType: 'debit',
      transactionType,
      contact,
    });

    // [
    //         ...Sale.getItemsAccounts(currentSaleItems),
    //         // {
    //         //   accountId: "shipping_charge",
    //         //   amount: currentSummary.shipping || 0,
    //         // },
    //         // {
    //         //   accountId: "other_charges",
    //         //   amount: currentSummary.adjustment || 0,
    //         // },
    //         //uncomment when tax calculation is enabled
    //         // { accountId: "tax_payable", amount: currentSummary.totalTax || 0 },
    //       ]
  }

  //----------------------------------------------------------------
  //----------------------------------------------------------------

  async appendIncomingSale(incomingSale?: ISaleForm) {
    if (!incomingSale) {
      throw new Error('Please provide  the incoming sale data');
    }

    const { items, customer, total } = incomingSale;
    console.log('incoming sale items', items);
    const contact = SaleJournal.createContactFromCustomer(customer);

    const incomingItemsAccounts = SaleJournal.groupItemsIntoAccounts(
      items || []
    );
    console.log('incoming items accounts', incomingItemsAccounts);

    const { accountsInstance, transactionType } = this;
    /**
     * loop through items income accounts.
     * credit each account
     */
    const [ARAccount] = await Promise.all([
      accountsInstance.getAccountData(ARAccountId),
      ...Object.keys(incomingItemsAccounts).map(async accountId => {
        const account = await accountsInstance.getAccountData(accountId);

        const amount = incomingItemsAccounts[accountId];

        /**
         * credit income accounts
         */
        this.appendIncomingEntry({
          account,
          amount,
          entryId: '',
          entryType: 'credit',
          transactionType,
          contact,
        });
      }),
    ]);

    /**
     * debit accounts_receivable account
     */
    this.appendIncomingEntry({
      account: ARAccount,
      amount: total,
      entryId: '',
      entryType: 'debit',
      transactionType,
      contact,
    });

    // [
    //         ...Sale.getItemsAccounts(currentSaleItems),
    //         // {
    //         //   accountId: "shipping_charge",
    //         //   amount: currentSummary.shipping || 0,
    //         // },
    //         // {
    //         //   accountId: "other_charges",
    //         //   amount: currentSummary.adjustment || 0,
    //         // },
    //         //uncomment when tax calculation is enabled
    //         // { accountId: "tax_payable", amount: currentSummary.totalTax || 0 },
    //       ]
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  //----------------------------------------------------------------

  //----------------------------------------------------------------

  //------------------------------------------------------------

  static groupItemsIntoAccounts(items: ISaleItem[]) {
    const accountsMap: Record<string, number> = {};

    items.forEach(item => {
      const { total, salesAccountId } = item;

      const currentTotal = accountsMap[salesAccountId] || 0;

      accountsMap[salesAccountId] = currentTotal + total;
    });

    console.log('items accounts map', accountsMap);

    return accountsMap;
  }
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

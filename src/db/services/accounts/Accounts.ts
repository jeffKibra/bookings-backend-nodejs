import { ClientSession } from 'mongodb';
//
import { AccountModel } from '../../models';
//
import { generateAccounts } from '../../../constants';
//
import {
  IAccount,
  IAccountSummary,
  IAccountType,
  IAccountMapping,
} from '../../../types';

//----------------------------------------------------------------

interface IMapAccount {
  accountId: string;
  amount: number;
}
//----------------------------------------------------------------

export default class Accounts {
  //common accounts
  static commonIds = {
    UR: 'unearned_revenue',
    AR: 'accounts_receivable',
    AP: 'accounts_payable',
    UF: 'undeposited_funds',
    PC: 'petty_cash',
    sales: 'sales',
    VB: 'vehicle_bookings',
    TC: 'transfer_charge',
    OBA: 'opening_balance_adjustments',
    OBO: 'opening_balance_offset',
  };

  accounts: Record<string, IAccountSummary>;
  //
  protected session: ClientSession;

  orgId: string;

  constructor(session: ClientSession, orgId: string) {
    this.session = session;
    this.accounts = {};
    this.orgId = orgId;
  }

  async getAccountData(accountId: string) {
    const currentAccounts = this.accounts;
    // console.log({ currentAccounts });

    const { orgId } = this;

    let account: IAccountSummary = currentAccounts[accountId];

    if (!account) {
      const rawAccount = await Accounts.getAccount(accountId, orgId);
      // console.log('getAccountData rawAccount', rawAccount);
      account = Accounts.formatAccount(rawAccount);
      // console.log('getAccountData account', account);

      this.accounts = {
        ...currentAccounts,
        [accountId]: account,
      };
    }

    return account;
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  static async getAccount(accountId: string, orgId: string) {
    const result = await AccountModel.findOne({
      accountId,
      $or: [{ 'metaData.orgId': 'all' }, { 'metaData.orgId': orgId }],
    });
    // console.log({ result });

    if (!result) {
      throw new Error(`Account data with id ${accountId} not found!`);
    }

    const account = result?.toJSON() as unknown as IAccount;

    // console.log('static async getAccount account', account);

    return account;
  }

  static formatAccount(account: IAccount) {
    const { accountType, name, accountId } = account;

    const summary: IAccountSummary = {
      accountId,
      accountType,
      name,
    };

    // console.log({ summary });

    return summary;
  }

  static formatAccounts(accountsData: IAccount[]) {
    const accounts: Record<string, IAccountSummary> = {};

    accountsData.forEach(accountFromDB => {
      const { accountId } = accountFromDB;

      const account = this.formatAccount(accountFromDB);

      accounts[accountId] = account;
    });

    return accounts;
  }

  static getAccountsMapping(
    currentItems: IMapAccount[],
    incomingItems: IMapAccount[]
  ) {
    /**
     * group both items arrays into their respective income accounts
     */
    const currentAccounts = this.summarizeItemsIntoAccounts(currentItems);
    const incomingAccounts = this.summarizeItemsIntoAccounts(incomingItems);

    return this.mapAccounts(currentAccounts, incomingAccounts);
  }

  static summarizeItemsIntoAccounts(
    items: {
      accountId: string;
      amount: number;
    }[]
  ) {
    const summaryObject = items.reduce(
      (summary: Record<string, number>, item) => {
        const { amount, accountId } = item;

        const currentTotal = summary[accountId];

        return {
          ...summary,
          [accountId]: currentTotal ? currentTotal + amount : amount,
        };
      },
      {} as Record<string, number>
    );

    return Object.keys(summaryObject).map(accountId => {
      return {
        accountId,
        amount: summaryObject[accountId],
      };
    });
  }

  static mapAccounts(
    currentAccounts: IMapAccount[],
    incomingAccounts: IMapAccount[]
  ) {
    console.log('currentAccounts', currentAccounts);
    console.log('incomingAccounts', incomingAccounts);
    const similarAccounts: IAccountMapping[] = [];
    const updatedAccounts: IAccountMapping[] = [];
    const newAccounts: IAccountMapping[] = [];
    const deletedAccounts: IAccountMapping[] = [];

    currentAccounts.forEach(account => {
      const { accountId, amount } = account;
      let dataMapping: IAccountMapping = {
        current: amount,
        incoming: 0,
        accountId,
      };
      /**
       * find if this income account is also in incoming accounts
       */
      const index = incomingAccounts.findIndex(
        incomingAccount => incomingAccount.accountId === accountId
      );

      if (index > -1) {
        /**
         * account is in both arrays
         * remove account from incomingAccounts array
         */
        const incomingTotal = incomingAccounts.splice(index, 1)[0].amount;
        dataMapping.incoming = incomingTotal;

        if (dataMapping.current === incomingTotal) {
          if (incomingTotal > 0) {
            similarAccounts.push(dataMapping);
          }
        } else {
          //values are not equal
          const isNewAccount = dataMapping.current === 0 && incomingTotal > 0;
          const isUpdatedAccount = dataMapping.current > 0 && incomingTotal > 0;
          const isDeletedAccount =
            dataMapping.current > 0 && incomingTotal === 0;

          if (isNewAccount) {
            newAccounts.push(dataMapping);
          } else if (isUpdatedAccount) {
            updatedAccounts.push(dataMapping);
          } else if (isDeletedAccount) {
            deletedAccounts.push(dataMapping);
          } else {
            console.log(
              `Invalid accounts mapping data accountId:${accountId} ` +
                `current:${dataMapping.current} incoming:${incomingTotal} `
            );
          }
        }
      } else {
        /**
         * account is in only the currentAccounts array
         * this means this account is to be deleted
         */
        if (dataMapping.current > 0) {
          deletedAccounts.push(dataMapping);
        }
      }
    });

    /**
     * check if there are items remaining in the incoming accounts array
     * add them the new accounts array
     */
    if (incomingAccounts.length > 0) {
      incomingAccounts.forEach(account => {
        const { amount, accountId } = account;

        if (amount > 0) {
          const dataMapping: IAccountMapping = {
            current: 0,
            incoming: amount,
            accountId,
          };

          newAccounts.push(dataMapping);
        }
      });
    }

    const uniqueAccounts = [
      ...similarAccounts,
      ...deletedAccounts,
      ...newAccounts,
      ...updatedAccounts,
    ];

    console.log('uniqueAccounts', uniqueAccounts);
    console.log('deletedAccounts', deletedAccounts);
    console.log('updatedAccounts', updatedAccounts);
    console.log('newAccounts', newAccounts);

    return {
      uniqueAccounts,
      similarAccounts,
      deletedAccounts,
      newAccounts,
      updatedAccounts,
    };
  }

  static async getAllAccounts(orgId: string) {
    const accountsData = await this.getAllAccountsRaw(orgId);

    if (!accountsData) {
      return null;
    }

    const accounts = this.formatAccounts(accountsData);

    console.log('accounts from db', accounts);

    return accounts;
  }

  static async getAllAccountsRaw(orgId: string) {
    const result = await AccountModel.find({
      $or: [{ 'metaData.orgId': orgId }, { 'metaData.orgId': 'all' }],
    }).exec();

    if (!result) {
      return null;
    }

    const accounts = result as unknown as IAccount[];

    // rawAccounts.forEach(account => {
    //   const { accountType, name, description, tags, _id, metaData } = account;

    //   accounts.push({
    //     _id: _id.toString(),
    //     name,
    //     accountType: accountType as IAccountType,
    //     description,
    //     tags,
    //     metaData: metaData,
    //   });
    // });

    console.log('accounts', accounts);

    return accounts;
  }

  static async populateDB() {
    const systemAccounts = generateAccounts();
    console.log({ systemAccounts });
    //log list to see
    const result = await AccountModel.insertMany(systemAccounts);

    console.log({ result });

    return result;
  }
}

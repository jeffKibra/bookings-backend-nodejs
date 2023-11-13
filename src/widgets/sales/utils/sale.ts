import {
  Transaction,
  FieldValue,
  getFirestore,
  DocumentSnapshot,
} from "firebase-admin/firestore";
import { getAccountsMapping, getAccountData } from "../../utils/accounts";
import Journal from "../../utils/journal";
import BigNumber from "bignumber.js";

import BookingsBase from "../../bookings/utils/BookingsBase";

import { ContactSummary, SummaryData } from "../../utils/summaries";

import {
  AccountsMapping,
  AccountMapping,
  Account,
  SaleTransactionTypes,
  IBookingForm,
  IContactSummary,
} from "../../types";

type TransactionType = keyof SaleTransactionTypes;

//----------------------------------------------------------------

interface SaleDetails {
  transactionId: string;
  userId: string;
  orgId: string;
  itemId: string;
  accounts: Record<string, Account>;
  transactionType: TransactionType;
  collectionPath: string;
}

export interface SaleDataAndAccount {
  saleDetails: IBookingForm;
  debitAccount: Account;
}

interface SummaryObject {
  [key: string]: number | FieldValue;
}

interface CustomerSummaryData {
  saleDetails: IBookingForm;
  summary: SummaryObject;
}
interface CustomerChangeData {
  saleDetails: IBookingForm;
  extraSummaryData: Record<string, number | FieldValue>;
}

//------------------------------------------------------------
const db = getFirestore();

export default class Sale extends BookingsBase {
  protected transaction: Transaction;

  collectionPath: string;
  transactionId: string;
  orgId: string;
  userId: string;
  accounts: Record<string, Account>;
  transactionType: TransactionType;

  ARAccount: Account;
  UFAccount: Account;

  constructor(transaction: Transaction, saleDetails: SaleDetails) {
    const {
      accounts,
      orgId,
      itemId,
      transactionId,
      transactionType,
      userId,
      collectionPath,
    } = saleDetails;

    super(transaction, orgId, itemId, transactionId, transactionType);

    this.transaction = transaction;

    this.collectionPath = collectionPath;
    this.transactionId = transactionId;
    this.userId = userId;
    this.orgId = orgId;
    this.accounts = accounts;
    this.transactionType = transactionType;
    //

    this.ARAccount = getAccountData("accounts_receivable", accounts);
    this.UFAccount = getAccountData("undeposited_funds", accounts);
  }

  //writing methods

  createJournalEntries(
    newAccounts: AccountMapping[],
    incomingSale: IBookingForm,
    entriesType: "debit" | "credit"
  ) {
    const { transaction, userId, orgId, transactionId } = this;

    console.log("creating entries", newAccounts, { transactionId });

    const journal = new Journal(transaction, userId, orgId);
    const contacts = Sale.createContactsFromCustomer(incomingSale.customer);

    newAccounts.forEach((mappedAccount) => {
      this.setJournalEntry(mappedAccount, contacts, journal, entriesType);
    });
  }

  updateJournalEntries(
    accountsMapping: AccountsMapping,
    incomingSale: IBookingForm,
    entriesType: "debit" | "credit"
  ) {
    const { transaction, userId, orgId } = this;

    const { similarAccounts, updatedAccounts } = accountsMapping;
    const accountsToUpdate = [...similarAccounts, ...updatedAccounts];

    const contacts = Sale.createContactsFromCustomer(incomingSale.customer);

    const journal = new Journal(transaction, userId, orgId);

    accountsToUpdate.forEach((data) => {
      this.setJournalEntry(data, contacts, journal, entriesType);
    });
  }

  //----------------------------------------------------------------
  setJournalEntry(
    accountToSet: AccountMapping,
    contacts: Record<string, IContactSummary>,
    journalInstance: Journal,
    entriesType: "debit" | "credit"
  ) {
    const { collectionPath, transactionId, accounts, transactionType } = this;

    const { accountId, incoming } = accountToSet;

    const account = getAccountData(accountId, accounts);

    if (entriesType === "credit") {
      journalInstance.creditAccount({
        account,
        amount: incoming,
        transactionCollection: collectionPath,
        transactionId,
        transactionType,
        contacts,
      });
    } else if (entriesType === "debit") {
      journalInstance.debitAccount({
        account,
        amount: incoming,
        transactionCollection: collectionPath,
        transactionId,
        transactionType,
        contacts,
      });
    } else {
      throw new Error(
        `Invalid entries type: ${entriesType} for account: ${accountId} `
      );
    }
  }

  deleteJournalEntries(deletedAccounts: AccountMapping[]) {
    const { transaction, userId, orgId, collectionPath, transactionId } = this;

    const journal = new Journal(transaction, userId, orgId);
    deletedAccounts.forEach(({ accountId }) => {
      journal.deleteEntry(`${collectionPath}/${transactionId}`, accountId);
    });
  }

  protected initCreateSale(incomingSale: IBookingForm) {
    return this.generateAccountsMappingAndSummary(incomingSale);
  }

  protected generateAccountsMappingAndSummary(
    incomingSale: IBookingForm | null,
    currentSale?: IBookingForm
  ) {
    const creditAccountsMapping = Sale.generateCreditAccounts(
      incomingSale,
      currentSale
    );
    const debitAccountsMapping = Sale.generateDebitAccounts(
      incomingSale,
      currentSale
    );

    const { accounts } = this;
    const creditAccountsSummary = Sale.generateAccountsSummary(
      creditAccountsMapping,
      accounts,
      "credit"
    );
    const debitAccountsSummary = Sale.generateAccountsSummary(
      debitAccountsMapping,
      accounts,
      "debit"
    );

    const accountsSummary = {
      ...debitAccountsSummary,
      ...creditAccountsSummary,
    };

    return {
      creditAccountsMapping,
      debitAccountsMapping,
      accountsSummary,
    };
  }

  protected async createSale(
    incomingSale: IBookingForm,
    creditAccountsMapping: AccountsMapping,
    debitAccountsMapping: AccountsMapping
  ) {
    await this.updateItemBookings(incomingSale);

    this.createJournalEntries(
      creditAccountsMapping.newAccounts,
      incomingSale,
      "credit"
    );
    this.createJournalEntries(
      debitAccountsMapping.newAccounts,
      incomingSale,
      "debit"
    );
  }

  protected async updateSale(
    incomingSale: IBookingForm,
    currentSale: IBookingForm,
    creditAccountsMapping: AccountsMapping,
    debitAccountsMapping: AccountsMapping
  ) {
    await this.updateItemBookings(incomingSale, currentSale);
    //create journal entries
    this.createJournalEntries(
      creditAccountsMapping.newAccounts,
      incomingSale,
      "credit"
    );
    this.createJournalEntries(
      debitAccountsMapping.newAccounts,
      incomingSale,
      "debit"
    );
    //update journal entries
    this.updateJournalEntries(creditAccountsMapping, incomingSale, "credit");
    this.updateJournalEntries(debitAccountsMapping, incomingSale, "debit");
    //delete journal entries
    this.deleteJournalEntries(creditAccountsMapping.deletedAccounts);
    this.deleteJournalEntries(debitAccountsMapping.deletedAccounts);
  }

  protected async deleteSale(
    currentSale: IBookingForm,
    creditDeletedAccounts: AccountMapping[],
    debitDeletedAccounts: AccountMapping[]
  ) {
    await this.updateItemBookings(null, currentSale);

    this.deleteJournalEntries(creditDeletedAccounts);
    this.deleteJournalEntries(debitDeletedAccounts);
  }

  changeCustomers(
    incomingData: CustomerChangeData,
    currentData: CustomerChangeData
  ) {
    const {
      extraSummaryData: incomingExtraSummaryData,
      saleDetails: incomingSale,
    } = incomingData;

    const {
      extraSummaryData: currentExtraSummaryData,
      saleDetails: currentSale,
    } = currentData;

    const { incomingCustomerAccountsSummary, currentCustomerAccountsSummary } =
      Sale.generateChangedCustomersAccountsSummaries(
        incomingSale,
        currentSale,
        this.accounts
      );

    this.updateChangedCustomers(
      {
        saleDetails: incomingSale,
        summary: {
          ...incomingCustomerAccountsSummary,
          ...incomingExtraSummaryData,
        },
      },
      {
        saleDetails: currentSale,
        summary: {
          ...currentCustomerAccountsSummary,
          ...currentExtraSummaryData,
        },
      }
    );
  }

  updateChangedCustomers(
    incomingCustomerSummaryData: CustomerSummaryData,
    currentCustomerSummaryData: CustomerSummaryData
  ) {
    const { transaction, orgId, accounts } = this;

    const {
      summary: incomingSummary,
      saleDetails: {
        customer: { id: incomingCustomerId },
      },
    } = incomingCustomerSummaryData;

    const incomingCustomerSummary = new ContactSummary(
      transaction,
      orgId,
      incomingCustomerId,
      accounts
    );
    incomingCustomerSummary.appendObject({
      ...incomingSummary,
    });

    const {
      summary: currentSummary,
      saleDetails: {
        customer: { id: currentCustomerId },
      },
    } = currentCustomerSummaryData;
    const currentCustomerSummary = new ContactSummary(
      transaction,
      orgId,
      currentCustomerId,
      accounts
    );

    currentCustomerSummary.appendObject({
      ...currentSummary,
    });

    //update
    currentCustomerSummary.update();
    incomingCustomerSummary.update();
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------
  static generateCreditAccounts(
    incomingSale: IBookingForm | null,
    currentSale?: IBookingForm
  ) {
    if (!incomingSale && !currentSale) {
      throw new Error(
        "Please provide atleast either the current or the incoming sale data"
      );
    }

    const currentSaleItem = currentSale?.item;
    const currentAccounts =
      currentSale && currentSaleItem
        ? [
            {
              accountId: currentSaleItem.salesAccount?.accountId,
              amount: currentSale.bookingTotal || 0,
            },
            {
              accountId: "transfer_charge",
              amount: currentSale.transferAmount || 0,
            },
            // { accountId: "tax_payable", amount
            // : currentSale.totalTax || 0 },
          ]
        : [];

    const incomingSaleItem = incomingSale?.item;
    const incomingAccounts =
      incomingSale && incomingSaleItem
        ? [
            {
              accountId: incomingSaleItem.salesAccount?.accountId,
              amount: incomingSale.bookingTotal || 0,
            },
            {
              accountId: "transfer_charge",
              amount: incomingSale.transferAmount || 0,
            },
            // {
            //   accountId: "tax_payable",
            //   amount: incomingSale.totalTax || 0,
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
    incomingSale: IBookingForm | null,
    currentSale?: IBookingForm
  ) {
    if (!incomingSale && !currentSale) {
      throw new Error(
        "Please provide atleast either the current or the incoming sale data"
      );
    }

    const currentDownPayment = currentSale?.downPayment?.amount || 0;
    const currentTotal = currentSale?.total || 0;
    const currentBalance = new BigNumber(currentTotal)
      .minus(currentDownPayment)
      .dp(2)
      .toNumber();
    const currentAccounts = currentSale
      ? [
          {
            accountId: "accounts_receivable",
            amount: currentBalance,
          },
          {
            accountId: "undeposited_funds",
            amount: currentDownPayment,
          },
          // { accountId: "tax_payable", amount
          // : currentSale.totalTax || 0 },
        ]
      : [];

    const incomingDownPayment = incomingSale?.downPayment?.amount || 0;
    const incomingTotal = incomingSale?.total || 0;
    const incomingBalance = new BigNumber(incomingTotal)
      .minus(incomingDownPayment)
      .dp(2)
      .toNumber();
    const incomingAccounts = incomingSale
      ? [
          {
            accountId: "accounts_receivable",
            amount: incomingBalance,
          },
          {
            accountId: "undeposited_funds",
            amount: incomingDownPayment,
          },
          // {
          //   accountId: "tax_payable",
          //   amount: incomingSale.totalTax || 0,
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
  static generateAccountsSummary(
    accountsMapping: AccountsMapping,
    accounts: Record<string, Account>,
    entriesType: "debit" | "credit"
  ) {
    const { uniqueAccounts } = accountsMapping;

    const summaryData = new SummaryData(accounts);

    uniqueAccounts.forEach((accountMapping) => {
      const { accountId } = accountMapping;
      const current = new BigNumber(accountMapping.current);
      const incoming = new BigNumber(accountMapping.incoming);
      const adjustment = incoming.minus(current).dp(2).toNumber();

      if (adjustment === 0) {
        return;
      }

      if (entriesType === "credit") {
        summaryData.creditAccount(accountId, adjustment);
      } else {
        summaryData.debitAccount(accountId, adjustment);
      }
    }, {});

    return summaryData.data;
  }

  //------------------------------------------------------------
  static generateChangedCustomersAccountsSummaries(
    incomingSale: IBookingForm,
    currentSale: IBookingForm,
    accounts: Record<string, Account>
  ) {
    //delete values from previous customer

    const currentCustomerCreditAccountsMapping = Sale.generateCreditAccounts(
      null,
      currentSale
    );
    const currentCustomerDebitAccountsMapping = Sale.generateDebitAccounts(
      null,
      currentSale
    );

    const currentCustomerCreditAccountsSummary = Sale.generateAccountsSummary(
      currentCustomerCreditAccountsMapping,
      accounts,
      "credit"
    );
    const currentCustomerDebitAccountsSummary = Sale.generateAccountsSummary(
      currentCustomerDebitAccountsMapping,
      accounts,
      "debit"
    );

    const currentCustomerAccountsSummary = {
      ...currentCustomerCreditAccountsSummary,
      ...currentCustomerDebitAccountsSummary,
    };

    //add new values to the incoming customer
    const incomingCustomerCreditAccountsMapping =
      Sale.generateCreditAccounts(incomingSale);
    const incomingCustomerDebitAccountsMapping =
      Sale.generateDebitAccounts(incomingSale);

    const incomingCustomerCreditAccountsSummary = Sale.generateAccountsSummary(
      incomingCustomerCreditAccountsMapping,
      accounts,
      "credit"
    );
    const incomingCustomerDebitAccountsSummary = Sale.generateAccountsSummary(
      incomingCustomerDebitAccountsMapping,
      accounts,
      "debit"
    );

    const incomingCustomerAccountsSummary = {
      ...incomingCustomerCreditAccountsSummary,
      ...incomingCustomerDebitAccountsSummary,
    };

    return {
      incomingCustomerAccountsSummary,
      currentCustomerAccountsSummary,
    };
  }

  //------------------------------------------------------------
  static async getSaleDataWithTransaction(
    transaction: Transaction,
    collectionPath: string,
    transactionId: string
  ) {
    const saleRef = db.collection(collectionPath).doc(transactionId);
    const snap = await transaction.get(saleRef);

    return Sale.retrieveSaleData(transactionId, snap);
  }

  //------------------------------------------------------------
  static async getSaleData(collectionPath: string, transactionId: string) {
    const saleRef = db.collection(collectionPath).doc(transactionId);
    const snap = await saleRef.get();

    return Sale.retrieveSaleData(transactionId, snap);
  }

  //------------------------------------------------------------

  static retrieveSaleData(transactionId: string, snap: DocumentSnapshot) {
    const data = snap.data();

    if (
      !snap.exists ||
      snap.data()?.status === "deleted" ||
      data === undefined
    ) {
      throw new Error(`Sale with id ${transactionId} not found!`);
    }

    return { ...data, id: snap.id };
  }

  //------------------------------------------------------------
  // static getItemsAccounts(items: SaleItem[]) {
  //   return items.map((saleItem) => {
  //     const {
  //       itemRateTotal,
  //       item: {
  //         salesAccount: { accountId },
  //       },
  //     } = saleItem;

  //     return { accountId, amount: itemRateTotal };
  //   });
  // }
  //------------------------------------------------------------
  static createContactsFromCustomer(customer?: IContactSummary) {
    if (!customer) {
      return {};
    }

    const { id, ...contactDetails } = customer;

    const contacts: Record<string, IContactSummary> = {
      [id]: {
        ...contactDetails,
        id,
      },
    };

    return contacts;
  }
}

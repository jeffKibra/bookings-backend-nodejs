import { Transaction } from "firebase-admin/firestore";
import BigNumber from "bignumber.js";

import { getAccountData } from "../../../utils/accounts";
import {
  OrgSummary,
  ContactSummary,
  SummaryData,
} from "../../../utils/summaries";
import Journal from "../../../utils/journal";
import { InvoiceSale } from "../../invoices/utils";
import { dbCollections } from "../../../utils/firebase";

import {
  Account,
  InvoiceFormData,
  IContactSummary,
  Invoice,
} from "../../../types";

interface OpeningBalanceData {
  accounts: Record<string, Account>;
  orgId: string;
  userId: string;
  invoiceId: string;
}

//------------------------------------------------------------------------------

export default class OpeningBalance extends InvoiceSale {
  OBAAccount: Account;
  salesAccount: Account;

  constructor(transaction: Transaction, data: OpeningBalanceData) {
    const { accounts, orgId, userId, invoiceId } = data;

    super(transaction, {
      accounts,
      invoiceId,
      orgId,
      userId,
      transactionType: "customer_opening_balance",
    });

    const salesAccount = getAccountData("sales", accounts);
    const OBAAccount = getAccountData("opening_balance_adjustments", accounts);

    if (!salesAccount) {
      throw new Error("Sales account not found!");
    }
    if (!OBAAccount) {
      throw new Error("Opening balance adjustments account not found!");
    }

    this.salesAccount = salesAccount;
    this.OBAAccount = OBAAccount;
  }

  generateInvoice(openingBalance: number, customer: IContactSummary) {
    const { salesAccount } = this;

    return OpeningBalance.generateInvoiceEquivalent(
      openingBalance,
      customer,
      salesAccount
    );
  }

  async create(obInvoice: InvoiceFormData) {
    const { transaction, orgId, OBAAccount, accounts, ARAccount } = this;

    const {
      total,
      customer: { id: customerId },
    } = obInvoice;

    await this.createWithoutSummary(obInvoice);

    const summary = new SummaryData(accounts);
    /**
     * 1. debit accounts_receivable account accountType= opening balance
     * 2. credit opening_balance_adjustments accountType= opening balance
     */
    summary.debitAccount(ARAccount.accountId, total);
    summary.creditAccount(OBAAccount.accountId, total);
    summary.append("invoices", 1);
    summary.append("overdueInvoices.amount", total);
    summary.append("overdueInvoices.count", 1);

    const orgSummaryInstance = new OrgSummary(transaction, orgId, accounts);
    orgSummaryInstance.data = summary.data;
    orgSummaryInstance.update();

    const customerSummaryInstance = new ContactSummary(
      transaction,
      orgId,
      customerId,
      accounts
    );
    customerSummaryInstance.data = summary.data;
    customerSummaryInstance.update();
  }

  async createWithoutSummary(obInvoice: InvoiceFormData) {
    const creditAccountsMapping = InvoiceSale.generateCreditAccounts(obInvoice);
    const debitAccountsMapping = InvoiceSale.generateDebitAccounts(obInvoice);

    await this.createInvoice(
      obInvoice,
      creditAccountsMapping,
      debitAccountsMapping
    );

    this.createOBEntries(obInvoice);
  }

  createOBEntries(incomingOBInvoice: InvoiceFormData) {
    const { orgId, transaction, userId, salesAccount, OBAAccount } = this;
    const customersCollection = dbCollections(orgId).contacts.path;

    const {
      customer: { id: customerId },
      total,
    } = incomingOBInvoice;

    const contacts = InvoiceSale.createContactsFromCustomer(
      incomingOBInvoice.customer
    );

    /**
     * 1. debit sales
     */
    const journal = new Journal(transaction, userId, orgId);
    journal.debitAccount({
      account: salesAccount,
      amount: total,
      transactionCollection: customersCollection,
      transactionId: customerId,
      transactionType: "opening_balance",
      contacts,
    });

    /**
     * 2. credit opening_balance_adjustments entry for customer opening balance
     */
    journal.creditAccount({
      account: OBAAccount,
      amount: total,
      transactionCollection: customersCollection,
      transactionId: customerId,
      transactionType: "opening_balance",
      contacts,
    });
  }

  async update(incomingOBInvoice: InvoiceFormData, currentOBInvoice: Invoice) {
    InvoiceSale.validateUpdate(incomingOBInvoice, currentOBInvoice);

    const { transaction, OBAAccount, orgId, accounts, ARAccount } = this;

    const { total: incomingTotal } = incomingOBInvoice;
    const {
      total: currentTotal,
      customer: { id: customerId },
    } = currentOBInvoice;
    /**
     * update invoice
     */
    const creditAccountsMapping = InvoiceSale.generateCreditAccounts(
      incomingOBInvoice,
      currentOBInvoice
    );

    const debitAccountsMapping = InvoiceSale.generateDebitAccounts(
      incomingOBInvoice,
      currentOBInvoice
    );

    await this.updateInvoice(
      incomingOBInvoice,
      currentOBInvoice,
      creditAccountsMapping,
      debitAccountsMapping,
      currentTotal
    );

    this.createOBEntries(incomingOBInvoice);

    const adjustment = new BigNumber(incomingTotal - currentTotal)
      .dp(2)
      .toNumber();
    // console.log({ adjustment });

    //update summaries
    const summary = new SummaryData(accounts);
    summary.debitAccount(ARAccount.accountId, adjustment);
    summary.creditAccount(OBAAccount.accountId, adjustment);

    const orgSummaryInstance = new OrgSummary(transaction, orgId, accounts);
    orgSummaryInstance.data = summary.data;
    orgSummaryInstance.update();

    const customerSummaryInstance = new ContactSummary(
      transaction,
      orgId,
      customerId,
      accounts
    );
    customerSummaryInstance.data = summary.data;
    customerSummaryInstance.update();
  }

  async delete(currentOBInvoice: Invoice) {
    InvoiceSale.validateDelete(currentOBInvoice);

    const { transaction, orgId, accounts, OBAAccount, ARAccount } = this;

    const { deletedAccounts: deletedCreditAccounts } =
      InvoiceSale.generateCreditAccounts(null, currentOBInvoice);
    const { deletedAccounts: deletedDebitAccounts } =
      InvoiceSale.generateDebitAccounts(null, currentOBInvoice);

    /**
     * delete invoice
     */
    await this.deleteInvoice(
      currentOBInvoice,
      deletedCreditAccounts,
      deletedDebitAccounts
    );

    const {
      total,
      customer: { id: customerId },
    } = currentOBInvoice;

    this.deleteOBEntries(customerId);

    const adjustment = new BigNumber(0 - total).dp(2).toNumber();

    //update accounts summaries
    const summary = new SummaryData(accounts);
    //reduce  debit
    summary.debitAccount(ARAccount.accountId, adjustment);
    //reduce credit
    summary.creditAccount(OBAAccount.accountId, adjustment);

    const orgSummaryInstance = new OrgSummary(transaction, orgId, accounts);
    orgSummaryInstance.data = summary.data;
    orgSummaryInstance.update();

    const customerSummaryInstance = new ContactSummary(
      transaction,
      orgId,
      customerId,
      accounts
    );
    customerSummaryInstance.data = summary.data;
    customerSummaryInstance.update();
  }

  deleteOBEntries(customerId: string) {
    const { transaction, userId, orgId, salesAccount, OBAAccount } = this;

    const customerPath = dbCollections(orgId).contacts.doc(customerId).path;

    const journal = new Journal(transaction, userId, orgId);

    journal.deleteEntry(customerPath, salesAccount.accountId);

    journal.deleteEntry(customerPath, OBAAccount.accountId);
  }

  //------------------------------------------------------------
  //static methods
  //------------------------------------------------------------
  static generateInvoiceEquivalent(
    openingBalance: number,
    customer: IContactSummary,
    salesAccount: Account
  ) {
    const invoiceForm: InvoiceFormData = {
      customer,
      saleDate: new Date(),
      dueDate: new Date(),
      // orderNumber: "",
      // subject: "",
      customerNotes: "",
      paymentTerm: { days: 0, name: "Due on Receipt", value: "on_receipt" },
      item: {
        itemId: "customer_opening_balance",
        salesAccount,
        rate: openingBalance,
        unit: "days",
        sku: "customer_opening_balance",
        type: "opening_balance",
        name: "customer opening balance",
      },
      downPayment: {
        paymentMode: { name: "", value: "" },
        amount: 0,
        reference: "",
      },
      quantity: 1,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      // dateRange: [new Date().toDateString(), new Date().toDateString()],
      bookingRate: openingBalance,
      bookingTotal: openingBalance,
      total: openingBalance,
      transferAmount: 0,
      // transactionType: "customer_opening_balance",
    };

    return invoiceForm;
  }
  //----------------------------------------------------------------
}

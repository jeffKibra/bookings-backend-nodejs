import {
  FieldValue,
  DocumentReference,
  Transaction,
} from "firebase-admin/firestore";
// import BigNumber from "bignumber.js";

import { dbCollections } from "../../../utils/firebase";
//Sale class
import { SaleDataAndAccount } from "../../utils/sale";
import {
  OrgSummary,
  ContactSummary,
  SummaryData,
} from "../../../utils/summaries";
import { getAccountData } from "../../../utils/accounts";

import InvoiceSale, { InvoiceDetails } from "./invoiceSale";

import {
  Account,
  InvoiceFormData,
  InvoiceFromDb,
  Invoice as InvoiceData,
} from "../../../types";

//----------------------------------------------------------------

//----------------------------------------------------------------
const { increment, serverTimestamp } = FieldValue;

export default class Invoice extends InvoiceSale {
  invoiceRef: DocumentReference<InvoiceFromDb>;
  // incomingInvoice: InvoiceFormData | null;
  // currentInvoice: Invoice | null;
  ARAccount: Account;

  errors: {
    [key: string]: string;
  } = { incoming: "Please provide incoming invoice data" };

  constructor(
    transaction: Transaction,
    invoiceDetails: Omit<InvoiceDetails, "transactionType">
  ) {
    // console.log({ invoiceDetails });
    const { accounts, invoiceId, orgId, userId } = invoiceDetails;

    super(transaction, {
      accounts,
      orgId,
      invoiceId,
      transactionType: "invoice",
      userId,
    });

    const ARAccount = getAccountData("accounts_receivable", accounts);
    this.ARAccount = ARAccount;

    const invoicesCollection = dbCollections(orgId).invoices;
    this.invoiceRef = invoicesCollection.doc(invoiceId);
  }

  async create(incomingInvoice: InvoiceFormData) {
    const { accounts, orgId, transaction, ARAccount } = this;

    const {
      customer: { id: customerId },
      total,
    } = incomingInvoice;

    const { creditAccountsMapping, debitAccountsMapping, accountsSummary } =
      this.initCreateSale(incomingInvoice);

    //create invoice
    await this.createInvoice(
      incomingInvoice,
      creditAccountsMapping,
      debitAccountsMapping
    );

    //initialize summaries
    const summary = new SummaryData(accounts);
    summary.appendObject(accountsSummary);
    summary.debitAccount(ARAccount.accountId, total);
    summary.append("invoices", 1);

    //update summaries on given collections
    const orgSummary = new OrgSummary(transaction, orgId, accounts);
    orgSummary.data = summary.data;
    orgSummary.update();

    const customerSummary = new ContactSummary(
      transaction,
      orgId,
      customerId,
      accounts
    );
    customerSummary.data = summary.data;
    customerSummary.update();
  }

  async update(incomingInvoice: InvoiceFormData, currentInvoice: InvoiceData) {
    const { transaction, orgId, accounts, ARAccount } = this;

    InvoiceSale.validateUpdate(incomingInvoice, currentInvoice);
    /**
     * initialize sale update-happens after fetching current invoice
     */
    const incomingInvoiceAndAccount: SaleDataAndAccount = {
      saleDetails: incomingInvoice,
      debitAccount: ARAccount,
    };
    const currentInvoiceAndAccount: SaleDataAndAccount = {
      saleDetails: currentInvoice,
      debitAccount: ARAccount,
    };

    const { accountsSummary, creditAccountsMapping, debitAccountsMapping } =
      this.generateAccountsMappingAndSummary(incomingInvoice, currentInvoice);

    // console.log({ accountsSummary, accountsMapping });

    const {
      customer: { id: customerId },
      // total: incomingTotal,
    } = incomingInvoice;

    const {
      customer: { id: currentCustomerId },
      total: currentTotal,
    } = currentInvoice;

    //update invoice
    await this.updateInvoice(
      incomingInvoice,
      currentInvoice,
      creditAccountsMapping,
      debitAccountsMapping,
      currentTotal
    );

    // const adjustment = new BigNumber(incomingTotal - currentTotal)
    //   .dp(2)
    //   .toNumber();

    const orgSummary = new OrgSummary(transaction, orgId, accounts);
    //initialize summary
    orgSummary.appendObject(accountsSummary);
    // orgSummary.debitAccount(ARAccount.accountId, adjustment);

    /**
     * check if customer has been changed
     */
    const customerHasChanged = currentCustomerId !== customerId;
    // console.log({ customerHasChanged });

    if (customerHasChanged) {
      this.changeCustomers(
        {
          ...incomingInvoiceAndAccount,
          extraSummaryData: { invoices: increment(1) },
        },
        {
          ...currentInvoiceAndAccount,
          extraSummaryData: { invoices: increment(-1) },
        }
      );
    } else {
      const customerSummary = new ContactSummary(
        transaction,
        orgId,
        customerId,
        accounts
      );
      //initialize summaries
      customerSummary.appendObject(orgSummary.data);
      customerSummary.update();
    }

    //update org summary
    orgSummary.update();
  }

  async delete(currentInvoice: InvoiceData) {
    InvoiceSale.validateDelete(currentInvoice);

    const { transaction, orgId, accounts } = this;

    const {
      customer: { id: customerId },
      // total,
    } = currentInvoice;

    const { accountsSummary, creditAccountsMapping, debitAccountsMapping } =
      this.generateAccountsMappingAndSummary(null, currentInvoice);

    /**
     * delete invoice
     */

    await this.deleteInvoice(
      currentInvoice,
      creditAccountsMapping.deletedAccounts,
      debitAccountsMapping.deletedAccounts
    );
    // console.log({ accountsSummary, accountsMapping });

    const summary = new SummaryData(accounts);
    summary.appendObject(accountsSummary);
    //reduce deibt amount
    // summary.debitAccount(
    //   ARAccount.accountId,
    //   new BigNumber(0 - total).dp(2).toNumber()
    // );
    summary.append("deletedInvoices", 1, 0);

    const orgSummary = new OrgSummary(transaction, orgId, accounts);
    orgSummary.data = summary.data;
    orgSummary.update();

    const customerSummary = new ContactSummary(
      transaction,
      orgId,
      customerId,
      accounts
    );
    customerSummary.data = summary.data;
    customerSummary.update();
  }

  //-------------------------------------------------------------

  static generateSystemUpdateData(
    data: Record<string, unknown>,
    systemTask = "UPDATE_OVERDUE_STATE"
  ) {
    return {
      ...data,
      overdueAt: serverTimestamp(),
      modifiedBy: "system", //mark to avoid infinite loops
      systemTask: systemTask,
      modifiedAt: serverTimestamp(),
    };
  }
}

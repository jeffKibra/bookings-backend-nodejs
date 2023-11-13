import {
  DocumentReference,
  Transaction,
  Timestamp,
  FieldValue,
  DocumentSnapshot,
} from "firebase-admin/firestore";
import BigNumber from "bignumber.js";

import { dbCollections } from "../../../utils/firebase";
import { getAccountData } from "../../../utils/accounts";

//Sale class
import { Sale } from "../../utils";

import {
  Account,
  InvoiceFormData,
  InvoiceFromDb,
  InvoiceTransactionTypes,
  Invoice,
  AccountsMapping,
  AccountMapping,
  InvoicePayments,
} from "../../../types";

// ----------------------------------------------------------------
const { serverTimestamp, increment } = FieldValue;

export interface InvoiceDetails {
  invoiceId: string;
  userId: string;
  orgId: string;
  accounts: Record<string, Account>;
  transactionType: keyof InvoiceTransactionTypes;
}

export default class InvoiceSale extends Sale {
  invoiceRef: DocumentReference<InvoiceFromDb>;
  // incomingInvoice: InvoiceFormData | null;
  // currentInvoice: Invoice | null;
  ARAccount: Account;

  errors: {
    [key: string]: string;
  } = { incoming: "Please provide incoming invoice data" };

  constructor(transaction: Transaction, invoiceDetails: InvoiceDetails) {
    // console.log({ invoiceDetails });
    const { accounts, transactionType, invoiceId, orgId, userId } =
      invoiceDetails;

    super(transaction, {
      accounts,
      orgId,
      itemId: "",
      transactionId: invoiceId,
      transactionType,
      userId,
      collectionPath: `organizations/${orgId}/invoices`,
    });

    const ARAccount = getAccountData("accounts_receivable", accounts);
    if (!ARAccount) {
      throw new Error("Accounts receivable account not found!");
    }
    this.ARAccount = ARAccount;

    const invoicesCollection = dbCollections(orgId).invoices;
    this.invoiceRef = invoicesCollection.doc(invoiceId);
  }

  async getCurrentInvoice() {
    const { orgId, transactionId, transaction } = this;

    return InvoiceSale.getInvoice(transaction, orgId, transactionId);
  }

  async createInvoice(
    incomingInvoice: InvoiceFormData,
    creditAccountsMapping: AccountsMapping,
    debitAccountsMapping: AccountsMapping
  ) {
    const { transaction, userId, orgId, transactionType, invoiceRef } = this;
    /**
     * create sale
     */
    await this.createSale(
      incomingInvoice,
      creditAccountsMapping,
      debitAccountsMapping
    );

    // create invoice
    // console.log({ incomingInvoice });

    const isOverdue =
      transactionType === "customer_opening_balance" ? true : false;

    transaction.create(invoiceRef, {
      ...incomingInvoice,
      balance: incomingInvoice.total,
      paymentsReceived: {},
      paymentsIds: [],
      paymentsCount: 0,
      status: 0,
      isSent: false,
      transactionType: transactionType as keyof InvoiceTransactionTypes,
      isOverdue,
      orgId,
      createdBy: userId,
      createdAt: serverTimestamp() as Timestamp,
      modifiedBy: userId,
      modifiedAt: serverTimestamp() as Timestamp,
    });
  }

  async updateInvoice(
    incomingInvoice: InvoiceFormData,
    currentInvoice: Invoice,
    creditAccountsMapping: AccountsMapping,
    debitAccountsMapping: AccountsMapping,
    currentTotal: number
  ) {
    // update invoice
    const { transaction, userId } = this;

    const { total } = incomingInvoice;

    /**
     * update sale
     */
    await this.updateSale(
      incomingInvoice,
      currentInvoice,
      creditAccountsMapping,
      debitAccountsMapping
    );

    /**
     * calculate balance adjustment
     */
    const balanceAdjustment = new BigNumber(total - currentTotal)
      .dp(2)
      .toNumber();
    // console.log({ balanceAdjustment });
    /**
     * update invoice
     */
    const invoice: Partial<InvoiceFromDb> = {
      ...incomingInvoice,
      balance: increment(balanceAdjustment) as unknown as number,
      modifiedBy: userId,
      modifiedAt: serverTimestamp() as Timestamp,
    };

    transaction.update(this.invoiceRef, {
      ...invoice,
    });
  }

  async deleteInvoice(
    currentInvoice: Invoice,
    deletedCreditAccounts: AccountMapping[],
    deletedDebitAccounts: AccountMapping[]
  ) {
    const { transaction, userId, invoiceRef } = this;

    // console.log("deleted accounts", deletedAccounts);
    /**
     * delete sale
     */
    await this.deleteSale(
      currentInvoice,
      deletedCreditAccounts,
      deletedDebitAccounts
    );
    /**
     * mark invoice as deleted
     */
    // console.log("deleting invoice");
    transaction.update(invoiceRef, {
      status: -1,
      // opius: "none",
      modifiedBy: userId,
      modifiedAt: serverTimestamp(),
    });
  }

  // ----------------------------------------------------------------
  // static methods
  // ----------------------------------------------------------------

  // static async createInvoiceId(
  //   transaction: Transaction,
  //   orgId: string,
  //   accounts: Record<string, Account>
  // ) {
  //   const summary = new Summary(transaction, orgId, accounts);

  //   const orgSummaryRef = Summary.createOrgRef(orgId);

  //   const summaryData = await summary.fetchSummaryData(orgSummaryRef.path);
  //   console.log({ summaryData });
  //   const currentInvoices = summaryData?.invoices as number;
  //   const invoiceNumber = (currentInvoices || 0) + 1;
  //   const invoiceId = `INV-${String(invoiceNumber).padStart(6, "0")}`;

  //   return invoiceId;
  // }

  //------------------------------------------------------------
  static validateDelete(invoice: Invoice) {
    /**
     * check if the invoice has payments
     */
    const paymentsTotal = InvoiceSale.getInvoicePaymentsTotal(
      invoice.paymentsReceived
    );
    if (paymentsTotal > 0) {
      // deletion not allowed
      throw new Error(
        `Invoice Deletion Failed! You cannot delete an invoice that has payments! If you are sure you want to delete it, Please DELETE all the associated PAYMENTS first!`
      );
    }
  }
  //------------------------------------------------------------
  static validateUpdate(
    incomingInvoice: InvoiceFormData,
    currentInvoice: Invoice
  ) {
    const {
      total,
      customer: { id: customerId },
    } = incomingInvoice;
    const {
      paymentsReceived,
      customer: { id: currentCustomerId },
    } = currentInvoice;
    /**
     * check to ensure the new total balance is not less than payments made.
     */
    const paymentsTotal = InvoiceSale.getInvoicePaymentsTotal(
      paymentsReceived || {}
    );
    /**
     * trying to update invoice total with an amount less than paymentsTotal
     * throw an error
     */
    if (paymentsTotal > total) {
      throw new Error(
        `Invoice Update Failed! The new Invoice Total is less than the invoice payments. If you are sure you want to edit, delete the associated payments or adjust them to be less than or equal to the new invoice total`
      );
    }
    /**
     * check if customer has been changed
     */
    const customerHasChanged = currentCustomerId !== customerId;
    /**
     * customer cannot be changed if the invoice has some payments made to it
     */
    if (paymentsTotal > 0 && customerHasChanged) {
      throw new Error(
        `CUSTOMER cannot be changed in an invoice that has payments! This is because all the payments are from the PREVIOUS customer. If you are sure you want to change the customer, DELETE the associated payments first!`
      );
    }
  }

  //------------------------------------------------------------
  static async createInvoiceId(orgId: string) {
    const invoicesCollection = dbCollections(orgId).invoices;

    const snap = await invoicesCollection
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    let prevInvoice = 0;

    if (snap.docs.length > 0) {
      prevInvoice = Number(snap.docs[0].id);
    }

    const invoiceNumber = prevInvoice + 1;
    // const invoiceId = `INV-${String(invoiceNumber).padStart(6, "0")}`;

    return `${invoiceNumber}`;
  }
  //------------------------------------------------------------

  static async getInvoice(
    transaction: Transaction,
    orgId: string,
    invoiceId: string
  ) {
    const invoiceRef = dbCollections(orgId).invoices.doc(invoiceId);
    const snap = await transaction.get(invoiceRef);

    return InvoiceSale.retrieveInvoiceFromSnap(snap);
  }
  //----------------------------------------------------------------

  static retrieveInvoiceFromSnap(snap: DocumentSnapshot<InvoiceFromDb>) {
    const data = snap.data();
    const id = snap.id;

    if (!snap.exists || data?.status === -1 || data === undefined) {
      throw new Error(`Invoice with id ${id} not found!`);
    }

    const invoice: Invoice = {
      ...data,
      id,
    };

    return invoice;
  }

  //------------------------------------------------------------------
  static getInvoicePaymentsTotal(payments: InvoicePayments) {
    const total = Object.keys(payments).reduce((sum, key) => {
      const payment = new BigNumber(payments[key]);
      return sum.plus(payment);
    }, new BigNumber(0));

    return total.dp(2).toNumber();
  }

  //----------------------------------------------------------------
}

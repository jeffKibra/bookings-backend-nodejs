import {
  Transaction,
  FieldValue,
  Timestamp,
  DocumentSnapshot,
} from "firebase-admin/firestore";
import BigNumber from "bignumber.js";

import { dbCollections } from "../../../utils/firebase";
import { Sale } from "../../utils";
import { Customer } from "../../customers/utils";

import { getAccountData } from "../../../utils/accounts";

import {
  SummaryData,
  OrgSummary,
  ContactSummary,
} from "../../../utils/summaries";

import {
  Account,
  SaleReceiptForm,
  SaleReceipt,
  SaleReceiptFromDb,
} from "../../../types";

//----------------------------------------------------------------

const { serverTimestamp } = FieldValue;

interface ReceiptDetails {
  accounts: Record<string, Account>;
  orgId: string;
  saleReceiptId: string;
  userId: string;
}

//------------------------------------------------------------

const walkInCustomer = Customer.walkInCustomer;

export default class ReceiptSale extends Sale {
  paymentAccount: Account;

  constructor(transaction: Transaction, receiptDetails: ReceiptDetails) {
    const { accounts, orgId, saleReceiptId, userId } = receiptDetails;

    super(transaction, {
      accounts,
      orgId,
      itemId: "",
      transactionId: saleReceiptId,
      transactionType: "sale_receipt",
      userId,
      collectionPath: `organizations/${orgId}/saleReceipts`,
    });

    const paymentAccount = getAccountData("undeposited_funds", accounts);

    this.paymentAccount = paymentAccount;
  }

  async create(receiptFormData: SaleReceiptForm) {
    const receiptData: Required<SaleReceiptForm> = {
      ...receiptFormData,
      customer: receiptFormData.customer || walkInCustomer,
    };

    const {
      customer: { id: customerId },
      paymentMode: { value: paymentModeId },
      downPayment: { amount: downPayment },
    } = receiptData;

    const { creditAccountsMapping, debitAccountsMapping, accountsSummary } =
      this.generateAccountsMappingAndSummary(receiptData);
    const { transaction, orgId, userId, transactionId, accounts } = this;

    /**
     * create sales
     */
    await this.createSale(
      receiptData,
      creditAccountsMapping,
      debitAccountsMapping
    );

    const summary = new SummaryData(accounts);
    summary.appendObject(accountsSummary);
    summary.debitPaymentMode(paymentModeId, downPayment);
    summary.append("saleReceipts", 1);

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

    /**
     * create saleReceipt
     */
    const saleReceiptsCollection = dbCollections(orgId).saleReceipts;
    const saleReceiptRef = saleReceiptsCollection.doc(transactionId);
    // console.log({ saleReceiptData });
    transaction.create(saleReceiptRef, {
      ...receiptData,
      status: 0,
      isSent: false,
      transactionType: "sale_receipt",
      orgId,
      createdBy: userId,
      createdAt: serverTimestamp() as Timestamp,
      modifiedBy: userId,
      modifiedAt: serverTimestamp() as Timestamp,
    });
  }

  async getCurrentReceipt() {
    const { orgId, transactionId, transaction } = this;

    const receiptRef = ReceiptSale.createReceiptRef(orgId, transactionId);

    const snap = await transaction.get(receiptRef);

    return ReceiptSale.processReceiptDataFromFirestore(snap);
  }

  //----------------------------------------------------------------

  //----------------------------------------------------------------

  async update(
    incomingReceiptForm: SaleReceiptForm,
    currentReceipt: SaleReceipt
  ) {
    const { transaction, orgId, userId, transactionId, accounts } = this;
    const incomingReceipt: Required<SaleReceiptForm> = {
      ...incomingReceiptForm,
      customer: incomingReceiptForm.customer || walkInCustomer,
    };

    const { accountsSummary, creditAccountsMapping, debitAccountsMapping } =
      this.generateAccountsMappingAndSummary(incomingReceipt, currentReceipt);

    const {
      customer: { id: incomingCustomerId },
      total: incomingTotal,
      paymentMode: { value: incomingPaymentModeId },
    } = incomingReceipt;

    const {
      customer: { id: currentCustomerId },
      total: currentTotal,
      paymentMode: { value: currentPaymentModeId },
    } = currentReceipt;

    const adjustment = new BigNumber(incomingTotal - currentTotal)
      .dp(2)
      .toNumber();
    const currentTotalDecrement = new BigNumber(0 - currentTotal)
      .dp(2)
      .toNumber();

    /**
     * update sale
     */
    await this.updateSale(
      incomingReceipt,
      currentReceipt,
      creditAccountsMapping,
      debitAccountsMapping
    );

    /**
     * update org summary
     */
    const orgSummary = new OrgSummary(transaction, orgId, accounts);
    orgSummary.appendObject(accountsSummary);

    const paymentModeHasChanged =
      incomingPaymentModeId !== currentPaymentModeId;

    if (paymentModeHasChanged) {
      //increase debit amount of incoming mode
      orgSummary.debitPaymentMode(incomingPaymentModeId, incomingTotal);
      //reduce debit of current mode
      orgSummary.debitPaymentMode(currentPaymentModeId, currentTotalDecrement);
    } else {
      orgSummary.debitPaymentMode(incomingPaymentModeId, adjustment);
    }

    orgSummary.update();
    /**
     * update customers summaries
     */
    const customerHasChanged = currentCustomerId !== incomingCustomerId;
    if (customerHasChanged) {
      const incomingCustomerSummary = new SummaryData(accounts);
      incomingCustomerSummary.append("saleReceipts", 1, 0);
      //increment incoming customer payment mode debit
      incomingCustomerSummary.debitPaymentMode(
        incomingPaymentModeId,
        incomingTotal
      );
      //
      const currentCustomerSummary = new SummaryData(accounts);
      currentCustomerSummary.append("saleReceipts", 0, 1);
      //decrease current customer payment mode debit
      currentCustomerSummary.debitPaymentMode(
        currentPaymentModeId,
        currentTotalDecrement
      );

      this.changeCustomers(
        {
          saleDetails: incomingReceipt,
          extraSummaryData: { ...incomingCustomerSummary.data },
        },
        {
          saleDetails: currentReceipt,
          extraSummaryData: { ...currentCustomerSummary.data },
        }
      );
    } else {
      const customerSummary = new ContactSummary(
        transaction,
        orgId,
        incomingCustomerId,
        accounts
      );
      customerSummary.appendObject(orgSummary.data);
      customerSummary.update();
    }

    /**
     * update sales receipt
     */
    const saleReceiptsCollection = dbCollections(orgId).saleReceipts;
    const saleReceiptRef = saleReceiptsCollection.doc(transactionId);
    transaction.update(saleReceiptRef, {
      ...incomingReceipt,
      // classical: "plus",
      modifiedBy: userId,
      modifiedAt: serverTimestamp(),
    });
  }

  async delete(receiptData: SaleReceipt) {
    const { transaction, transactionId, orgId, userId, accounts } = this;

    const {
      customer: { id: customerId },
      total,
      paymentMode: { value: paymentModeId },
    } = receiptData;

    const { accountsSummary, creditAccountsMapping, debitAccountsMapping } =
      this.generateAccountsMappingAndSummary(null, receiptData);

    /**
     * delete sale
     */
    await this.deleteSale(
      receiptData,
      creditAccountsMapping.deletedAccounts,
      debitAccountsMapping.deletedAccounts
    );
    /**
     * delete sale receipt
     */
    const totalDecrement = new BigNumber(0 - total).dp(2).toNumber();
    const summary = new SummaryData(accounts);
    summary.appendObject(accountsSummary);
    //decrease payment mode debit
    summary.debitPaymentMode(paymentModeId, totalDecrement);
    summary.append("deletedSaleReceipts", 1, 0);

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

    /**
     * mark saleReceipt as deleted
     */
    const saleReceiptsCollection = dbCollections(orgId).saleReceipts;
    const saleReceiptRef = saleReceiptsCollection.doc(transactionId);
    transaction.update(saleReceiptRef, {
      status: -1,
      modifiedBy: userId,
      modifiedAt: serverTimestamp(),
    });
  }

  //----------------------------------------------------------------------
  //static functions
  //----------------------------------------------------------------------
  static createReceiptRef(orgId: string, receiptId: string) {
    return dbCollections(orgId).saleReceipts.doc(receiptId);
  }
  //----------------------------------------------------------------------
  static processReceiptDataFromFirestore(
    docSnap: DocumentSnapshot<SaleReceiptFromDb>
  ) {
    const data = docSnap.data();
    const id = docSnap.id;

    if (!docSnap.exists || !data || data.status === -1) {
      throw new Error(`Sales Receipt with id ${id} not found!`);
    }

    const saleReceipt: SaleReceipt = {
      ...data,
      saleReceiptId: id,
    };
    return saleReceipt;
  }
  //----------------------------------------------------------------------

  static async getSaleReceiptData(
    orgId: string,
    saleReceiptId: string
  ): Promise<SaleReceipt> {
    const saleReceiptRef = ReceiptSale.createReceiptRef(orgId, saleReceiptId);
    const snap = await saleReceiptRef.get();

    return ReceiptSale.processReceiptDataFromFirestore(snap);
  }

  //------------------------------------------------------------
  static async createReceiptId(orgId: string) {
    const receiptsCollection = dbCollections(orgId).saleReceipts;

    const snap = await receiptsCollection
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    let prevReceiptId = 0;

    if (snap.docs.length > 0) {
      const lastDoc = snap.docs[0];

      prevReceiptId = Number(lastDoc.id);
    }

    const receiptNumber = prevReceiptId + 1;
    // const receiptId = `SR-${String(receiptNumber).padStart(6, "0")}`;

    return `${receiptNumber}`;
  }

  //----------------------------------------------------------------
  static reformatDates(data: SaleReceiptForm): SaleReceiptForm {
    const { saleDate } = data;
    const formData = {
      ...data,
      saleDate: new Date(saleDate),
    };

    return formData;
  }
}

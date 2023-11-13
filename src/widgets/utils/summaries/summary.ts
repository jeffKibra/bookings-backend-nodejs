import {
  FieldValue,
  getFirestore,
  DocumentReference,
  WriteBatch,
  Transaction,
} from "firebase-admin/firestore";

import SummaryData from "./summaryData";

import { Account } from "../../types";

interface AggregationData {
  [key: string]: unknown;
  accounts: Record<string, number>;
  paymentModes: Record<string, number>;
}

//------------------------------------------------------------
const db = getFirestore();
const { serverTimestamp } = FieldValue;

export default class Summary extends SummaryData {
  protected batch: WriteBatch | null;
  protected transaction: Transaction | null;

  orgId: string;

  constructor(
    firestoreWriteMethods: WriteBatch | Transaction,
    orgId: string,
    accounts: Record<string, Account>
  ) {
    super(accounts);

    if (firestoreWriteMethods instanceof Transaction) {
      this.transaction = firestoreWriteMethods;
      this.batch = null;
    } else if (firestoreWriteMethods instanceof WriteBatch) {
      this.batch = firestoreWriteMethods;
      this.transaction = null;
    } else {
      console.log({ firestoreWriteMethods });
      throw new Error("Invalid param firestoreWriteMethods");
    }

    this.orgId = orgId;
  }

  fetchSummaryData(docPath: string) {
    return Summary.fetchSummaryData(docPath);
  }

  //------------------------------------------------------------
  updateSummary(summaryRef: DocumentReference) {
    const { data, batch, transaction } = this;

    Summary.validateUpdate(data);

    const isEmpty = Summary.checkIfEmpty(data);
    // console.log({ isEmpty, data });
    if (isEmpty) return;

    if (transaction) {
      transaction.update(summaryRef, {
        ...data,
      });
    } else if (batch) {
      batch.update(summaryRef, {
        ...data,
      });
    }
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------
  static validateUpdate(data: unknown) {
    const invalidSummary = !data || typeof data !== "object";
    if (invalidSummary) {
      throw new Error(
        "cannot update summary with invalid data: data must be an object. Current data:" +
          data
      );
    }
  }
  //------------------------------------------------------------
  static validateCreate(data: unknown) {
    const dataIsEmpty = Summary.checkIfEmpty(data);
    // console.log("validating create", { dataIsEmpty, data });
    if (dataIsEmpty) {
      throw new Error(
        "cannot create summary without data, current data:" + data
      );
    }
  }

  //------------------------------------------------------------
  static checkIfEmpty(data: unknown) {
    return !data || Object.keys(data).length === 0;
  }

  //------------------------------------------------------------
  static async fetchSummaryData(docPath: string) {
    const docRef = db.doc(docPath);

    const snap = await docRef.get();

    if (!snap.exists) throw new Error("Summary data not found!");

    const data = snap.data();

    const accounts: Record<string, number> = data?.accounts || {};

    let summaryData: AggregationData;
    summaryData = {
      ...data,
      accounts,
      customers: data?.customers || 0,
      deletedInvoices: data?.deletedInvoices || 0,
      deletedPayments: data?.deletedPayments || 0,
      expenses: data?.expenses || 0,
      invoices: data?.invoices || 0,
      payments: data?.payments || 0,
      invoicesTotal: data?.invoicesTotal || 0,
      items: data?.items || 0,
      paymentModes: data?.paymentModes || {},
      paymentsTotal: data?.paymentsTotal || 0,
      saleReceipts: data?.saleReceipts || 0,
      vendors: data?.vendors || 0,
    };

    return summaryData;
  }

  //----------------------------------------------------------------
  protected static createSummary(summaryRef: DocumentReference) {
    const data = Summary.creationData;

    Summary.validateCreate(data);

    summaryRef.set(
      {
        ...data,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  //------------------------------------------------------------
  protected static createSummaryUsingBatch(
    batch: WriteBatch,
    summaryRef: DocumentReference
  ) {
    const data = Summary.creationData;

    Summary.validateCreate(data);

    batch.set(
      summaryRef,
      {
        ...data,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
        status: 0, //if org is deleted-update to -1
      },
      { merge: true }
    );
  }

  //----------------------------------------------------------------
  //------------------------------------------------------------
  //------------------------------------------------------------
  // static async checkDailySummary(collectionPath: string) {
  //   const { yearMonthDay } = getDateDetails();
  //   const docRef = db.collection(collectionPath).doc(yearMonthDay);

  //   const snap = await docRef.get();

  //   if (snap.exists) {
  //     data = snap.data() as { [key: string]: unknown };
  //   }

  //   let data: { [key: string]: unknown };

  //   //fetch latest summary
  //   data = await Summary.fetchLatestSummary(collectionPath);

  //   return summaryData;
  // }
  //------------------------------------------------------------------
  // static async fetchLatestSummary(collectionPath: string) {
  //   const snap = await db
  //     .collection(collectionPath)
  //     .orderBy("createdAt", "desc")
  //     .limit(1)
  //     .get();

  //   let data: { [key: string]: unknown };

  //   if (snap.empty) {
  //     data = Summary.creationData;
  //   } else {
  //     data = snap.docs[0].data() as { [key: string]: unknown };
  //   }

  //   return data;
  // }
}

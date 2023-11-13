import {
  getFirestore,
  WriteBatch,
  DocumentReference,
} from "firebase-admin/firestore";

import SummaryBase from "./summary";

import { Account } from "../../types";

//------------------------------------------------------------
const db = getFirestore();

export default class VendorSummary extends SummaryBase {
  vendorId: string;
  summaryRef: DocumentReference;

  constructor(
    batch: WriteBatch,
    orgId: string,
    vendorId: string,
    accounts: Record<string, Account>
  ) {
    super(batch, orgId, accounts);
    this.vendorId = vendorId;

    this.summaryRef = VendorSummary.createRef(orgId, vendorId);
  }

  fetchCurrentSummary() {
    const { summaryRef } = this;
    const docPath = summaryRef.path;

    return this.fetchSummaryData(docPath);
  }

  fetchSummaryData(docPath: string) {
    return VendorSummary.fetchSummaryData(docPath);
  }

  //------------------------------------------------------------
  update() {
    const { summaryRef } = this;

    this.updateSummary(summaryRef);
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  static createWithBatch(batch: WriteBatch, orgId: string, vendorId: string) {
    const summaryRef = VendorSummary.createRef(orgId, vendorId);
    return VendorSummary.createSummaryUsingBatch(batch, summaryRef);
  }

  //----------------------------------------------------------------

  static create(orgId: string, vendorId: string) {
    const summaryRef = VendorSummary.createRef(orgId, vendorId);
    return VendorSummary.createSummary(summaryRef);
  }

  //------------------------------------------------------------
  static createRef(orgId: string, vendorId: string, summaryId = "main") {
    return db.doc(
      `organizations/${orgId}/vendors/${vendorId}/summary/${summaryId}`
    );
  }
}

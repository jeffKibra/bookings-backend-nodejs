import {
  getFirestore,
  WriteBatch,
  Transaction,
} from "firebase-admin/firestore";

import Summary from "./summary";

import { Account } from "../../types";

//------------------------------------------------------------
const db = getFirestore();

export default class OrgSummary extends Summary {
  constructor(
    firestoreWriteMethods: WriteBatch | Transaction,
    orgId: string,
    accounts: Record<string, Account>
  ) {
    super(firestoreWriteMethods, orgId, accounts);
  }

  fetchCurrentSummary() {
    const { orgId } = this;
    const docPath = OrgSummary.createRef(orgId).path;

    return this.fetchSummaryData(docPath);
  }

  //------------------------------------------------------------
  update() {
    const { orgId } = this;
    const summaryRef = OrgSummary.createRef(orgId);

    this.updateSummary(summaryRef);
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------
  static createWithBatch(batch: WriteBatch, orgId: string) {
    const summaryRef = OrgSummary.createRef(orgId);
    return OrgSummary.createSummaryUsingBatch(batch, summaryRef);
  }
  //----------------------------------------------------------------
  static create(orgId: string) {
    const summaryRef = OrgSummary.createRef(orgId);
    return OrgSummary.createSummary(summaryRef);
  }
  //------------------------------------------------------------

  static createRef(orgId: string, summaryId = "main") {
    return db.doc(`organizations/${orgId}/summary/${summaryId}`);
  }
}

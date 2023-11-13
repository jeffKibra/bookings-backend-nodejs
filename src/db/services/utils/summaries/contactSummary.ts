import {
  getFirestore,
  WriteBatch,
  Transaction,
} from "firebase-admin/firestore";

import SummaryBase from "./summary";
import { dbCollectionsPaths } from "../../constants";

import { Account } from "../../types";

//------------------------------------------------------------
const db = getFirestore();

export default class ContactSummary extends SummaryBase {
  contactId: string;

  constructor(
    firestoreWriteMethods: WriteBatch | Transaction,
    orgId: string,
    contactId: string,
    accounts: Record<string, Account>
  ) {
    super(firestoreWriteMethods, orgId, accounts);

    this.contactId = contactId;
  }

  fetchCurrentSummary() {
    const { orgId, contactId } = this;
    const docPath = ContactSummary.createRef(orgId, contactId).path;

    return this.fetchSummaryData(docPath);
  }

  //------------------------------------------------------------
  update() {
    const { orgId, contactId } = this;

    const summaryRef = ContactSummary.createRef(orgId, contactId);

    this.updateSummary(summaryRef);
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------
  static create(orgId: string, contactId: string) {
    const summaryRef = ContactSummary.createRef(orgId, contactId);
    return ContactSummary.createSummary(summaryRef);
  }

  //------------------------------------------------------------
  static createWithBatch(batch: WriteBatch, orgId: string, contactId: string) {
    const summaryRef = ContactSummary.createRef(orgId, contactId);
    return ContactSummary.createSummaryUsingBatch(batch, summaryRef);
  }

  //------------------------------------------------------------

  static createRef(orgId: string, contactId: string, summaryId = "main") {
    return db.doc(
      `${dbCollectionsPaths.contactsSummary(orgId, contactId)}/${summaryId}`
    );
  }
  //------------------------------------------------------------
}

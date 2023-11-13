import { getFirestore, FieldValue } from "firebase-admin/firestore";

import Summary from "./summary";

//------------------------------------------------------------
const db = getFirestore();
const { serverTimestamp } = FieldValue;

export default class DailyOrgSummary {
  orgId: string;
  summaryId: string;

  constructor(orgId: string, summaryId: string) {
    this.orgId = orgId;
    this.summaryId = summaryId;
  }

  fetchSummary(orgId: string, summaryId: string) {
    const docPath = DailyOrgSummary.createRef(orgId, summaryId).path;

    return Summary.fetchSummaryData(docPath);
  }
  //------------------------------------------------------------

  create(data: Record<string, unknown>) {
    const { orgId, summaryId } = this;

    const summaryRef = DailyOrgSummary.createRef(orgId, summaryId);
    return summaryRef.set(
      { ...data, createdAt: serverTimestamp() },
      { merge: true }
    );
  }

  //----------------------------------------------------------------
  //static methods
  //----------------------------------------------------------------

  static createRef(orgId: string, summaryId: string) {
    return db.doc(
      `organizations/${orgId}/summary/main/dailySummaries/${summaryId}`
    );
  }
}

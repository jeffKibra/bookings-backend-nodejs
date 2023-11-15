import * as functions from "firebase-functions";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

import { isAuthenticated } from "../utils/auth";
import { fetchOrgData } from "./utils";

//------------------------------------------------------------
const db = getFirestore();
const { serverTimestamp } = FieldValue;

const setup = functions.https.onCall((data: { orgId: string }, context) => {
  const auth = isAuthenticated(context);

  return setupOrg(auth.uid, data.orgId);
});

export default setup;

export async function setupOrg(userId: string, orgId: string) {
  try {
    const [orgData] = await Promise.all([fetchOrgData(orgId)]);
    if (orgData.status === 1) {
      //org setup was completed- exit function
      return null;
    }

    const orgRef = db.collection("organizations").doc(orgId);

    const batch = db.batch();

    batch.update(orgRef, {
      status: 1,
      modifiedBy: userId,
      modifiedAt: serverTimestamp(),
    });

    const result = await batch.commit();
    return result;
    //-------------------------------
  } catch (err) {
    const error = err as Error;
    console.log(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
}

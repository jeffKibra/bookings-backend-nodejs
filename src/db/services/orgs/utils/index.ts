import { getFirestore } from "firebase-admin/firestore";

import { Org } from "../../types";
//----------------------------------------------------------------
const db = getFirestore();

export function getOrg(userId: string) {
  // console.log("getting org", userId);

  return db
    .collection("organizations")
    .where("createdBy", "==", userId)
    .where("status", "in", [0, 1])
    .limit(1)
    .get()
    .then((snap) => {
      if (snap.empty) {
        return null;
      }

      const orgDoc = snap.docs[0];

      return {
        ...orgDoc.data(),
        orgId: orgDoc.id,
      };
    });
}

export async function fetchOrgData(orgId: string) {
  const orgRef = db.collection("organizations").doc(orgId);

  const snap = await orgRef.get();

  if (!snap.exists) {
    throw new Error(`Data for organization with id ${orgId} not found!`);
  }

  const dbData = snap.data() as Omit<Org, "orgId">;

  const orgData: Org = {
    ...dbData,
    orgId,
  };

  return orgData;
}

export async function userHasOrg(userId: string) {
  if (userId) {
    const org = await getOrg(userId);
    if (org) {
      throw new Error("You have an Organization already registered!");
    }
  } else {
    throw new Error("Unknow error");
  }
}

//------------------------------------------------------------

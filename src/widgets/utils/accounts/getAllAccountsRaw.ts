import { getFirestore } from "firebase-admin/firestore";

import { AccountFromDb } from "../../types";

//----------------------------------------------------------------
const db = getFirestore();

export default async function getAllAccountsRaw(orgId: string) {
  const accountsDoc = await db
    .doc(`organizations/${orgId}/orgDetails/accounts`)
    .get();

  if (!accountsDoc.exists) {
    throw new Error(
      "Something went wrong with accounts! If the error persists, contact support for help!"
    );
  }

  const accountsData = accountsDoc.data() as {
    [key: string]: AccountFromDb;
  };

  console.log("accounts from db", accountsData);

  return accountsData;
}

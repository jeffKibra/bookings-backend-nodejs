import { CollectionReference, getFirestore } from "firebase-admin/firestore";

//----------------------------------------------------------------
const db = getFirestore();

// export { default as dbCollections } from "./dbCollections";

export const createCollection = <T>(collectionName: string) => {
  return db.collection(collectionName) as CollectionReference<T>;
};

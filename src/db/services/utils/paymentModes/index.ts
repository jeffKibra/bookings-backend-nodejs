import { getFirestore } from "firebase-admin/firestore";

import { PaymentMode } from "../../../../types";
//------------------------------------------------------------
const db = getFirestore();

export async function fetchPaymentModes(orgId: string) {
  const orgRef = db.collection("organizations").doc(orgId);
  const paymentModesRef = orgRef.collection("orgDetails").doc("paymentModes");

  const snap = await paymentModesRef.get();

  if (!snap.exists) {
    throw new Error("Payment modes not found!");
  }

  const paymentModes = snap.data() as PaymentMode[];

  return paymentModes;
}

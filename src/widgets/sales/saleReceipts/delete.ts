import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import regionalFunctions from "../../regionalFunctions";

import { isAuthenticated } from "../../utils/auth";
import { getAllAccounts } from "../../utils/accounts";

import { ReceiptSale } from "./utils";

//------------------------------------------------------------
const db = getFirestore();

const deleteReceipt = regionalFunctions.https.onCall(
  async (
    payload: {
      orgId: string;
      saleReceiptId: string;
    },
    context
  ) => {
    const auth = isAuthenticated(context);
    const orgId = payload?.orgId;
    const saleReceiptId = payload?.saleReceiptId;

    if (typeof orgId !== "string" || typeof saleReceiptId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Please provide an orgId and a saleReceiptId  to continue"
      );
    }

    try {
      const userId = auth.uid;

      const accounts = await getAllAccounts(orgId);

      await db.runTransaction(async (transaction) => {
        const receiptInstance = new ReceiptSale(transaction, {
          accounts,
          orgId,
          userId,
          saleReceiptId,
        });

        const currentReceipt = await receiptInstance.getCurrentReceipt();

        await receiptInstance.delete(currentReceipt);
      });
    } catch (err) {
      const error = err as Error;
      console.log(error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "unknown error"
      );
    }
  }
);

export default deleteReceipt;

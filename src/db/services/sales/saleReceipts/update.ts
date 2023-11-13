import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import regionalFunctions from "../../regionalFunctions";

import { isAuthenticated } from "../../utils/auth";
import { getAllAccounts } from "../../utils/accounts";

import { ReceiptSale } from "./utils";

import { SaleReceiptForm } from "../../types";

//------------------------------------------------------------
const db = getFirestore();

const update = regionalFunctions.https.onCall(
  async (
    payload: {
      orgId: string;
      saleReceiptId: string;
      formData: SaleReceiptForm;
    },
    context
  ) => {
    const auth = isAuthenticated(context);
    const orgId = payload?.orgId;
    const saleReceiptId = payload?.saleReceiptId;
    let formData = payload?.formData;

    if (
      typeof orgId !== "string" ||
      typeof saleReceiptId !== "string" ||
      !formData ||
      typeof formData !== "object"
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Please provide an orgId, a saleReceiptId and saleReceipt form data to continue"
      );
    }

    //todo: add data validation

    try {
      formData = ReceiptSale.reformatDates(formData);

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

        await receiptInstance.update(formData, currentReceipt);
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

export default update;

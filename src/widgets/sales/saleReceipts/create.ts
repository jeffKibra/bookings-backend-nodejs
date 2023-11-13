import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import regionalFunctions from "../../regionalFunctions";

import { isAuthenticated } from "../../utils/auth";
import { getAllAccounts } from "../../utils/accounts";

import { ReceiptSale } from "./utils";

import { SaleReceiptForm } from "../../types";

//------------------------------------------------------------
const db = getFirestore();

const create = regionalFunctions.https.onCall(
  async (payload: { orgId: string; formData: SaleReceiptForm }, context) => {
    // console.log("creating sales receipt", payload);
    const auth = isAuthenticated(context);
    const orgId = payload?.orgId;
    let formData = payload?.formData;

    if (
      typeof orgId !== "string" ||
      !formData ||
      typeof formData !== "object"
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Please provide an orgId and saleReceipt form data to continue"
      );
    }

    //todo: add data validation

    try {
      formData = ReceiptSale.reformatDates(formData);
      const userId = auth.uid;

      const accounts = await getAllAccounts(orgId);

      const receiptId = await ReceiptSale.createReceiptId(orgId);
      // console.log({ receiptId });

      await db.runTransaction(async (transaction) => {
        const receiptInstance = new ReceiptSale(transaction, {
          accounts,
          orgId,
          userId,
          saleReceiptId: receiptId,
        });

        await receiptInstance.create(formData);
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

export default create;

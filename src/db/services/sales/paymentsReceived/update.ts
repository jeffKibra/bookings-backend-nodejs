import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import regionalFunctions from "../../regionalFunctions";

import { isAuthenticated } from "../../utils/auth";
import { getAllAccounts } from "../../utils/accounts";

import { PaymentReceived } from "./utils";

import { PaymentReceivedForm } from "../../types";

//------------------------------------------------------------
const db = getFirestore();

const update = regionalFunctions.https.onCall(
  async (
    payload: {
      orgId: string;
      paymentId: string;
      formData: PaymentReceivedForm;
    },
    context
  ) => {
    const auth = isAuthenticated(context);

    try {
      const userId = auth.uid;
      const { orgId, paymentId } = payload;
      const formData = PaymentReceived.reformatDates(payload.formData);
      const accounts = await getAllAccounts(orgId);

      const batch = db.batch();

      const paymentInstance = new PaymentReceived(batch, {
        accounts,
        orgId,
        paymentId,
        userId,
      });
      const currentPayment = await paymentInstance.fetchCurrentPayment();

      paymentInstance.update(formData, currentPayment);

      await batch.commit();
    } catch (err) {
      const error = err as Error;
      console.log(error);

      throw new functions.https.HttpsError(
        "unknown",
        error.message || "unknown error"
      );
    }
  }
);

export default update;

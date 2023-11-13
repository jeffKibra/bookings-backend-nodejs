import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
//
import regionalFunctions from "../../regionalFunctions";

import { isAuthenticated } from "../../utils/auth";
import { getAllAccounts } from "../../utils/accounts";

import { Bookings } from "./utils";

//------------------------------------------------------------
const db = getFirestore();

const deleteBooking = regionalFunctions.https.onCall(
  async (
    payload: {
      orgId: string;
      bookingId: string;
      itemId: string;
    },
    context
  ) => {
    const auth = isAuthenticated(context);
    const orgId = payload?.orgId;
    const bookingId = payload?.bookingId;
    const itemId = payload?.itemId;

    if (typeof orgId !== "string" || typeof bookingId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Please provide an orgId and a bookingId  to continue"
      );
    }

    try {
      const userId = auth.uid;

      const accounts = await getAllAccounts(orgId);

      await db.runTransaction(async (transaction) => {
        const bookingInstance = new Bookings(transaction, {
          accounts,
          orgId,
          itemId,
          userId,
          bookingId,
        });

        const currentBooking = await bookingInstance.getCurrentBooking();

        await bookingInstance.delete(currentBooking);
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

export default deleteBooking;

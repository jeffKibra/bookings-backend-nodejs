import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
//
import regionalFunctions from "../../regionalFunctions";

import { isAuthenticated } from "../../utils/auth";
import { getAllAccounts } from "../../utils/accounts";

import { Bookings } from "./utils";

import { IBookingForm } from "../../types";

//------------------------------------------------------------
const db = getFirestore();

const update = regionalFunctions.https.onCall(
  async (
    payload: {
      orgId: string;
      bookingId: string;
      formData: IBookingForm;
    },
    context
  ) => {
    const auth = isAuthenticated(context);
    const orgId = payload?.orgId;
    const bookingId = payload?.bookingId;
    let formData = payload?.formData;

    if (
      typeof orgId !== "string" ||
      typeof bookingId !== "string" ||
      !formData ||
      typeof formData !== "object"
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Please provide an orgId, a bookingId and booking form data to continue"
      );
    }

    //todo: add data validation

    try {
      formData = Bookings.reformatDates(formData);
      const itemId = formData?.item?.itemId;

      const userId = auth.uid;

      const accounts = await getAllAccounts(orgId);

      await db.runTransaction(async (transaction) => {
        const receiptInstance = new Bookings(transaction, {
          accounts,
          orgId,
          itemId,
          userId,
          bookingId,
        });

        const currentReceipt = await receiptInstance.getCurrentBooking();

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

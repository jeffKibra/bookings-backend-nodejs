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

const create = regionalFunctions.https.onCall(
  async (payload: { orgId: string; formData: IBookingForm }, context) => {
    // console.log("creating sales booking", payload);
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
        "Please provide an orgId and booking form data to continue"
      );
    }

    //todo: add data validation

    try {
      formData = Bookings.reformatDates(formData);
      const itemId = formData?.item?.itemId;
      const userId = auth.uid;

      const accounts = await getAllAccounts(orgId);

      const bookingId = await Bookings.createBookingId(orgId);
      // console.log({ bookingId });

      await db.runTransaction(async (transaction) => {
        const bookingInstance = new Bookings(transaction, {
          accounts,
          orgId,
          itemId,
          userId,
          bookingId: bookingId,
        });

        await bookingInstance.create(formData);
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

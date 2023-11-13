import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import regionalFunctions from "../../regionalFunctions";

import { isAuthenticated } from "../../utils/auth";

import { Customer } from "./utils";

import { getAllAccounts } from "../../utils/accounts";

//------------------------------------------------------------
const db = getFirestore();

const deleteCustomer = regionalFunctions.https.onCall(
  async (payload: { orgId: string; customerId: string }, context) => {
    const auth = isAuthenticated(context);

    if (payload?.customerId === Customer.walkInCustomer.id) {
      throw new functions.https.HttpsError(
        "aborted",
        "You cannot delete a system customer!"
      );
    }

    try {
      const userId = auth.uid;
      const { orgId, customerId } = payload;

      await Customer.validateDelete(orgId, customerId);

      const accounts = await getAllAccounts(orgId);

      const batch = db.batch();

      const customer = new Customer(batch, orgId, userId, accounts, customerId);

      customer.delete();

      await batch.commit();
    } catch (err) {
      const error = err as Error;
      console.log(error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

export default deleteCustomer;

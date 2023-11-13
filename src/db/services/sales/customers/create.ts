import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import regionalFunctions from "../../regionalFunctions";

import { isAuthenticated } from "../../utils/auth";
import { ContactSummary } from "../../utils/summaries";
import { IContactForm } from "../../types";

import { Customer, OpeningBalance } from "./utils";

import { getAllAccounts } from "../../utils/accounts";

//------------------------------------------------------------
const db = getFirestore();

const create = regionalFunctions.https.onCall(
  async (payload: { orgId: string; formData: IContactForm }, context) => {
    const auth = isAuthenticated(context);

    const openingBalance = payload?.formData?.openingBalance;
    if (openingBalance < 0) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Customer Opening Balance cannot be a negative number"
      );
    }

    try {
      const userId = auth.uid;
      const { orgId, formData } = payload;

      const accounts = await getAllAccounts(orgId);

      const customerId = db
        .collection("organizations")
        .doc(orgId)
        .collection("customers")
        .doc().id;

      await ContactSummary.create(orgId, customerId);

      await db.runTransaction(async (transaction) => {
        const customer = new Customer(
          transaction,
          orgId,
          userId,
          accounts,
          customerId
        );

        let invoiceId = "";
        //create opening balance if any.
        if (openingBalance > 0) {
          invoiceId = await OpeningBalance.createInvoiceId(orgId);
          const ob = new OpeningBalance(transaction, {
            accounts,
            orgId,
            userId,
            invoiceId,
          });

          const customerDataSummary = Customer.createDataSummary(
            customerId,
            formData
          );

          const obInvoice = ob.generateInvoice(
            openingBalance,
            customerDataSummary
          );
          //create opening balance
          await ob.create(obInvoice);
        }

        //create customer
        customer.create(formData, invoiceId);
      });
    } catch (err) {
      const error = err as Error;
      console.log(error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

export default create;

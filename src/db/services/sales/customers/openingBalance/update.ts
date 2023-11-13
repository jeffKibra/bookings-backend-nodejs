import * as functions from "firebase-functions";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import regionalFunctions from "../../../regionalFunctions";

import { Customer, OpeningBalance } from "../utils";

import { getAllAccounts } from "../../../utils/accounts";
import { isAuthenticated } from "../../../utils/auth";

import { IContactFromDb } from "../../../types";

//------------------------------------------------------------
const db = getFirestore();
const { serverTimestamp } = FieldValue;

const update = regionalFunctions.https.onCall(
  async (
    payload: { orgId: string; customerId: string; amount: number },
    context
  ) => {
    const auth = isAuthenticated(context);

    const validData =
      typeof payload?.orgId === "string" &&
      typeof payload?.customerId === "string" &&
      typeof payload?.amount === "number";
    if (!validData) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The submitted data is not valid. Please provide an orgId, customerId and an amount to continue!"
      );
    }

    const { orgId, customerId, amount } = payload;

    if (amount < 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "opening balance cannot be negative!"
      );
    }

    try {
      const userId = auth.uid;

      const accounts = await getAllAccounts(orgId);

      await db.runTransaction(async (transaction) => {
        const customerInstance = new Customer(
          transaction,
          orgId,
          userId,
          accounts,
          customerId
        );
        const [customer] = await Promise.all([
          customerInstance.fetchCurrentCustomer(),
        ]);
        const {
          openingBalance: {
            amount: currentAmount,
            transactionId: currentInvoiceId,
          },
        } = customer;

        if (amount === currentAmount) {
          return;
        }

        let invoiceId = currentInvoiceId;

        if (!invoiceId) {
          invoiceId = await OpeningBalance.createInvoiceId(orgId);
        }

        const obInstance = new OpeningBalance(transaction, {
          accounts,
          invoiceId,
          orgId,
          userId,
        });

        const customerDataSummary = Customer.createDataSummary(
          customerId,
          customer
        );
        const obInvoice = obInstance.generateInvoice(
          amount,
          customerDataSummary
        );

        const isNew = currentAmount === 0 && amount > 0;
        const isUpdate = currentAmount > 0 && amount > 0;
        const isDelete = currentAmount > 0 && amount === 0;

        if (isNew) {
          obInstance.create(obInvoice);
        } else {
          if (!currentInvoiceId) {
            throw new Error("Opening balance id not found!");
          }

          const currentInvoice = await obInstance.getCurrentInvoice();

          if (isUpdate) {
            obInstance.update(obInvoice, currentInvoice);
          } else if (isDelete) {
            obInstance.delete(currentInvoice);
          } else {
            throw new Error("Invalid current opening balance!");
          }
        }

        //update customer
        const customerRef = Customer.createCustomerRef(orgId, customerId);
        const customerUpdateData: Partial<IContactFromDb> = {
          openingBalance: {
            amount,
            transactionId: amount > 0 ? invoiceId : "",
          },
          modifiedBy: userId,
          modifiedAt: serverTimestamp() as Timestamp,
        };

        transaction.update(customerRef, customerUpdateData);
      });
    } catch (err) {
      const error = err as Error;
      console.log(error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Unknown error"
      );
    }
  }
);

export default update;

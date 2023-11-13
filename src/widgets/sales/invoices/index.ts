import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import regionalFunctions from "../../regionalFunctions";

import { Invoice } from "./utils";
import { getAllAccounts } from "../../utils/accounts";

import { InvoiceFormData } from "../../types";

//------------------------------------------------------------
const db = getFirestore();

function reformatDates(data: InvoiceFormData): InvoiceFormData {
  const { saleDate, dueDate } = data;
  const formData = {
    ...data,
    saleDate: new Date(saleDate),
    dueDate: new Date(dueDate),
  };

  return formData;
}

exports.create = regionalFunctions.https.onCall(
  async (payload: { orgId: string; formData: InvoiceFormData }, context) => {
    const { auth } = context;

    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Action not allowed!"
      );
    }
    const userId = auth.uid;

    try {
      const { orgId } = payload;

      const formData = reformatDates(payload.formData);
      // console.log({ formData });

      const accounts = await getAllAccounts(orgId);

      const invoiceId = await Invoice.createInvoiceId(orgId);

      await db.runTransaction(async (transaction) => {
        const invoices = new Invoice(transaction, {
          accounts,
          invoiceId,
          orgId,
          userId,
        });

        await invoices.create(formData);
      });
    } catch (err) {
      const error = err as Error;
      console.log(error);

      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

exports.update = regionalFunctions.https.onCall(
  async (
    payload: { orgId: string; invoiceId: string; formData: InvoiceFormData },
    context
  ) => {
    const { auth } = context;

    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Action not allowed!"
      );
    }
    const userId = auth.uid;

    try {
      const { orgId, invoiceId } = payload;
      const accounts = await getAllAccounts(orgId);

      const formData = reformatDates(payload.formData);

      await db.runTransaction(async (transaction) => {
        const invoices = new Invoice(transaction, {
          accounts,
          invoiceId,
          orgId,
          userId,
        });

        const currentInvoice = await invoices.getCurrentInvoice();

        await invoices.update(formData, currentInvoice);
      });
    } catch (err) {
      const error = err as Error;
      console.log(error);

      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

exports.delete = regionalFunctions.https.onCall(
  async (payload: { orgId: string; invoiceId: string }, context) => {
    const { auth } = context;

    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Action not allowed!"
      );
    }
    const userId = auth.uid;

    try {
      const { orgId, invoiceId } = payload;
      const accounts = await getAllAccounts(orgId);

      await db.runTransaction(async (transaction) => {
        const invoices = new Invoice(transaction, {
          accounts,
          invoiceId,
          orgId,
          userId,
        });

        const currentInvoice = await invoices.getCurrentInvoice();

        await invoices.delete(currentInvoice);
      });
    } catch (err) {
      const error = err as Error;
      console.log(error);

      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

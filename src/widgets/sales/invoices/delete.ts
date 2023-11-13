import { Invoice } from './utils';
import { getAllAccounts } from '../../utils/accounts';

import { InvoiceFormData } from '../../../types';

//------------------------------------------------------------

export default async function deleteInvoice(payload: {
  orgId: string;
  invoiceId: string;
}) {
  const { auth } = context;

  if (!auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Action not allowed!'
    );
  }
  const userId = auth.uid;

  try {
    const { orgId, invoiceId } = payload;
    const accounts = await getAllAccounts(orgId);

    await db.runTransaction(async transaction => {
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

    throw new functions.https.HttpsError('internal', error.message);
  }
}

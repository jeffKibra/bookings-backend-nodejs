import { startSession } from 'mongoose';
//
import { Invoice } from './utils';
import { getAllAccounts } from '../../utils/accounts';

import { IInvoiceForm } from '../../../../types';

//------------------------------------------------------------

export default async function update(
  orgId: string,
  userUID: string,
  invoiceId: string,
  formData: IInvoiceForm
) {
  const session = await startSession();
  session.startTransaction();

  try {
    const formattedData = Invoice.reformatDates(formData);

    const invoices = new Invoice(session, {
      invoiceId,
      orgId,
      userId: userUID,
      saleType: 'normal',
    });

    await invoices.update(formattedData);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();

    const error = err as Error;
    console.log(error);

    throw err;
  } finally {
    await session.endSession();
  }
}

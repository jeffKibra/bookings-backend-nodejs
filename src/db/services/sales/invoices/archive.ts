import { startSession } from 'mongoose';
//
import { Invoice } from './utils';

//------------------------------------------------------------

export default async function archive(
  orgId: string,
  userUID: string,
  invoiceId: string
) {
  const session = await startSession();
  session.startTransaction();

  try {
    const invoices = new Invoice(session, {
      invoiceId,
      orgId,
      userId: userUID,
      saleType: 'normal',
    });

    await invoices.delete();

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

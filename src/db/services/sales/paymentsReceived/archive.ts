import { startSession } from 'mongoose';
//
import { PaymentReceived } from './utils';

//------------------------------------------------------------

async function archive(userUID: string, orgId: string, paymentId: string) {
  const session = await startSession();
  session.startTransaction();

  try {
    const paymentInstance = new PaymentReceived(session, {
      orgId,
      paymentId,
      userId: userUID,
    });
    const currentPayment = await paymentInstance.fetchCurrentPayment();

    await paymentInstance.delete(currentPayment);

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

export default archive;

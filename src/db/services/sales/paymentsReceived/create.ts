import { startSession } from 'mongoose';
import { ObjectId } from 'mongodb';
//
import { PaymentReceived } from './utils';

import { IPaymentReceivedForm } from '../../../../types';

//------------------------------------------------------------

async function create(
  orgId: string,
  userUID: string,
  formData: IPaymentReceivedForm
) {
  const session = await startSession();
  session.startTransaction();

  try {
    const formattedData = PaymentReceived.reformatDates(formData);

    const paymentId = new ObjectId().toString();

    const paymentInstance = new PaymentReceived(session, {
      orgId,
      paymentId,
      userId: userUID,
    });

    await paymentInstance.create(formattedData);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();

    const error = err as Error;
    console.log(error);

    throw new Error(error.message || 'unknown error');
  } finally {
    await session.endSession();
  }
}

export default create;

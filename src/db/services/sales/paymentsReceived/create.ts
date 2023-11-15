import { startSession } from 'mongoose';
//
import { PaymentReceived } from './utils';

import { PaymentReceivedForm } from '../../../../types';

//------------------------------------------------------------

async function create(
  orgId: string,
  userUID: string,
  formData: PaymentReceivedForm
) {
  const session = await startSession();
  session.startTransaction();

  try {
    const formattedData = PaymentReceived.reformatDates(formData);

    const paymentId = await PaymentReceived.createPaymentId(orgId);

    const paymentInstance = new PaymentReceived(batch, {
      accounts,
      orgId,
      paymentId,
      userId,
    });

    paymentInstance.create(formData);

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

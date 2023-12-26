import { startSession } from 'mongoose';

import { PaymentReceived } from './utils';

import { IUserPaymentReceivedForm } from '../../../../types';

//------------------------------------------------------------

async function update(
  orgId: string,
  userUID: string,
  paymentId: string,
  formData: IUserPaymentReceivedForm
) {
  const session = await startSession();
  session.startTransaction();

  try {
    const formattedData = PaymentReceived.reformatDates(formData);

    const paymentInstance = new PaymentReceived(session, {
      orgId,
      paymentId,
      userId: userUID,
    });
    const currentPayment = await paymentInstance.fetchCurrentPayment();

    await paymentInstance.update(formattedData, currentPayment);

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

export default update;

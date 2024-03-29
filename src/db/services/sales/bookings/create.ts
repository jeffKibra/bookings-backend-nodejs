import BigNumber from 'bignumber.js';
import { startSession, ClientSession } from 'mongoose';
import { ObjectId } from 'mongodb';
//
import { formatBookingFormData, Bookings } from './utils';
import { Invoice } from '../invoices/utils';
//
import { handleDBError } from '../../utils';
//
//
import { IBookingForm } from '../../../../types';
//
import { PaymentReceived } from '../paymentsReceived/utils';

//

export default async function createBooking(
  userUID: string,
  orgId: string,
  formData: IBookingForm
) {
  if (!userUID || !orgId || !formData) {
    throw new Error(
      'Missing Params: Either userUID or orgId or formData is missing!'
    );
  }

  const {
    downPayment: { amount: downPayment },
    total,
  } = formData;

  if (downPayment > total) {
    throw new Error(
      `Failed to create Booking! Imprest given: ${Number(
        downPayment
      ).toLocaleString()} is more than the booking total amount: ${Number(
        total
      ).toLocaleString()}.`
    );
  }

  const balance = new BigNumber(total).minus(downPayment).dp(2).toNumber();

  const formattedFormData = formatBookingFormData(formData);

  const {
    vehicle: { _id: vehicleId },
  } = formData;

  const session = await startSession();
  session.startTransaction();

  try {
    const invoiceId = new ObjectId().toString();
    console.log({ invoiceId });

    await Bookings.validateFormData(orgId, formattedFormData, session);

    const invoiceForm = await Bookings.createInvoiceFormFromBooking(
      orgId,
      formData
    );
    console.log('invoice form', invoiceForm);

    const invoiceInstance = new Invoice(session, {
      invoiceId,
      orgId,
      userId: userUID,
      saleType: 'car_booking',
    });

    const [result] = await Promise.all([
      invoiceInstance.create(invoiceForm),
      makeDownPayment(orgId, userUID, invoiceId, formattedFormData, session),
    ]);

    console.log('result', result);

    await session.commitTransaction();

    return invoiceId;
  } catch (error) {
    await session.abortTransaction();
    //handle errors
    handleDBError(error, 'Error Saving Booking');
  } finally {
    await session.endSession();
  }
}

async function makeDownPayment(
  orgId: string,
  userUID: string,
  invoiceId: string,
  formData: IBookingForm,
  session: ClientSession
) {
  const { downPayment, customer, saleDate } = formData;
  const { amount, paymentMode, reference } = downPayment;

  if (amount <= 0) {
    return;
  }

  const paymentId = new ObjectId().toString();
  const paymentInstance = new PaymentReceived(session, {
    orgId,
    userId: userUID,
    paymentId,
    transactionType: 'invoice_down_payment',
  });

  // const paymentAccount = await paymentInstance.getAccountData(
  //   PaymentReceived.commonIds.UF
  // );

  await paymentInstance.create({
    // account: paymentAccount,
    amount,
    customer,
    paymentMode,
    reference,
    paymentDate: saleDate || new Date(),
    allocations: [
      {
        invoiceId,
        amount,
        transactionType: 'invoice_down_payment',
      },
    ],
  });
}

import BigNumber from 'bignumber.js';
import { ObjectId } from 'mongodb';

//
import { IBookingForm } from '../../../../types';
//

export default async function create(
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

  const {
    vehicle: { _id: vehicleId },
  } = formData;

  const bookingObjectId = new ObjectId();
  const bookingId = bookingObjectId.toString();
  console.log({ bookingId });
}

// import { Invoice } from './utils';
// import { getAllAccounts } from '../../utils/accounts';

// import { InvoiceFormData } from '../../../../types';

// //------------------------------------------------------------

// export default async function create(
//   payload: { orgId: string; formData: InvoiceFormData },
//   context
// ) {
//   const { auth } = context;

//   if (!auth) {
//     throw new functions.https.HttpsError(
//       'unauthenticated',
//       'Action not allowed!'
//     );
//   }
//   const userId = auth.uid;

//   try {
//     const { orgId } = payload;

//     const formData = reformatDates(payload.formData);
//     // console.log({ formData });

//     const accounts = await getAllAccounts(orgId);

//     const invoiceId = await Invoice.createInvoiceId(orgId);

//     await db.runTransaction(async transaction => {
//       const invoices = new Invoice(transaction, {
//         accounts,
//         invoiceId,
//         orgId,
//         userId,
//       });

//       await invoices.create(formData);
//     });
//   } catch (err) {
//     const error = err as Error;
//     console.log(error);

//     throw new functions.https.HttpsError('internal', error.message);
//   }
// }

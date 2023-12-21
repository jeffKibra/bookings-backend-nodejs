import { ObjectId, Decimal128 } from 'mongodb';
import { ClientSession } from 'mongoose';
//
import { InvoiceModel } from '../../../models';
import { IInvoice } from '../../../../types';
//
import { PaymentReceived } from './utils';
//

// function formatInvoice(invoice) {
//   const formattedInvoice: IInvoice = {};

//   return formattedInvoice;
// }

export async function getById(orgId: string, paymentId: string) {
  const paymentData = await PaymentReceived.fetchPaymentData(paymentId);

  console.log('get payment received by id Result', paymentData);

  // if (!paymentData) {
  //   return null;
  // }

  // const {
  //   metaData: { createdBy },
  // } = paymentData;

  // if (userUID !== createdBy) {
  //   throw new Error('Action not Authorized!');
  // }

  return paymentData;
}

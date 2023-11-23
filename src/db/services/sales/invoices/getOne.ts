import { ObjectId, Decimal128 } from 'mongodb';
import { ClientSession } from 'mongoose';
//
import { InvoiceModel } from '../../../models';
import { IInvoice } from '../../../../types';
//
import { Invoice } from './utils';
//

// function formatInvoice(invoice) {
//   const formattedInvoice: IInvoice = {};

//   return formattedInvoice;
// }

export async function getById(
  orgId: string,
  userUID: string,
  invoiceId: string
) {
  const instance = new Invoice(null, {
    invoiceId,
    orgId,
    userId: userUID,
    saleType: 'car_booking',
  });

  const invoice = await instance.getCurrentInvoice();
  console.log('getInvoiceByIdResult', invoice);

  return invoice;
}

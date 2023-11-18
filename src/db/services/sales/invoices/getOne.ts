import { ObjectId } from 'mongodb';
import { ClientSession } from 'mongoose';
//
import { BookingModel } from '../../../models';
import { IInvoice } from '../../../../types';
//

export async function getById(invoiceId: string, orgId: string) {
  if (!invoiceId || !orgId) {
    throw new Error('Invalid Params: Errors in params [orgId|invoiceId]!');
  }

  // console.log('fetching vehicle for id ' + invoiceId);

  const result = await BookingModel.findById(invoiceId).exec();

  if (!result) {
    return null;
  }

  const invoice: IInvoice = result.toJSON();
  // as unknown as IInvoice;

  return invoice;
}

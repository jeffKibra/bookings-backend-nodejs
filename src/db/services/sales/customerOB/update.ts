import { ObjectId } from 'mongodb';
import { startSession } from 'mongoose';
//
import { InvoiceModel } from '../../../models';
//
import { CustomerOpeningBalance } from './utils';
import { Contact } from '../../contacts/utils';

import { IContactFromDb, IContact } from '../../../../types';

//------------------------------------------------------------

async function update(
  orgId: string,
  userUID: string,
  customerId: string,
  amount: number
) {
  const validData =
    typeof orgId === 'string' &&
    typeof customerId === 'string' &&
    typeof amount === 'number';
  if (!validData) {
    throw new Error(
      'The submitted data is not valid. Please provide an orgId, customerId and an amount to continue!'
    );
  }

  if (amount < 0) {
    throw new Error('opening balance cannot be negative!');
  }

  const session = await startSession();
  session.startTransaction();

  let updatedCustomer: IContact | null = null;

  try {
    const contactInstance = new Contact(session, orgId, userUID, customerId);
    const [customer, currentInvoice] = await Promise.all([
      contactInstance.fetchCurrentContact(),
      CustomerOpeningBalance.getCustomerOBInvoice(orgId, customerId),
    ]);

    const currentInvoiceId = currentInvoice?._id || '';

    let currentAmount = currentInvoice?.total || 0;
    let invoiceId = currentInvoiceId;

    if (amount === currentAmount) {
      //amounts have not changed
      return;
    }

    if (!invoiceId) {
      invoiceId = new ObjectId().toString();
    }

    const obInstance = new CustomerOpeningBalance(session, {
      invoiceId,
      orgId,
      userId: userUID,
      customerId,
    });

    const customerDataSummary = Contact.createContactSummary(
      customerId,
      customer
    );

    const obInvoice = await obInstance.generateInvoice(
      amount,
      customerDataSummary
    );

    const isNew = currentAmount === 0 && amount > 0;
    const isUpdate = currentAmount > 0 && amount > 0;
    const isDelete = currentAmount > 0 && amount === 0;

    if (isNew) {
      await obInstance._create(obInvoice);
    } else {
      if (!currentInvoiceId) {
        throw new Error('Opening balance id not found!');
      }

      // const currentInvoice = await obInstance.getCurrentInvoice();

      if (isUpdate) {
        await obInstance.update(obInvoice);
      } else if (isDelete && currentInvoice) {
        await obInstance.delete(currentInvoice);
      } else {
        throw new Error('Invalid current opening balance!');
      }
    }

    //update customer
    updatedCustomer = await contactInstance.updateOpeningBalance(
      amount,
      invoiceId
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    //
    const error = err as Error;
    console.log(error);
    throw new Error(error.message || 'Unknown error');
  } finally {
    await session.endSession();
  }

  return updatedCustomer;
}

export default update;

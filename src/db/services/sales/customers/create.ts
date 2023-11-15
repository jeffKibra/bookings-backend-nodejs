import { ObjectId, ClientSession } from 'mongodb';
import { startSession } from 'mongoose';

import { IContactForm } from '../../../../types';

import { Customer, OpeningBalance } from './utils';

import { getAllAccounts } from '../../utils/accounts';

//------------------------------------------------------------

async function create(userUID: string, orgId: string, formData: IContactForm) {
  const openingBalance = formData?.openingBalance;
  if (openingBalance < 0) {
    throw new Error('Customer Opening Balance cannot be a negative number');
  }

  const session = await startSession();
  session.startTransaction();

  try {
    const customerId = new ObjectId().toString();

    const customer = new Customer(session, orgId, userUID, customerId);

    let invoiceId = '';
    //create opening balance if any.
    if (openingBalance > 0) {
      invoiceId = new ObjectId().toString();

      const ob = new OpeningBalance(session, {
        orgId,
        userId: userUID,
        invoiceId,
      });

      const customerDataSummary = Customer.createCustomerSummary(
        customerId,
        formData
      );

      const obInvoice = await ob.generateInvoice(
        openingBalance,
        customerDataSummary
      );
      //create opening balance
      await ob.create(obInvoice);
    }

    //create customer
    customer.create(formData, invoiceId);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();

    const error = err as Error;
    console.log(error);
    throw new Error(error.message);
  } finally {
    await session.endSession();
  }
}

export default create;

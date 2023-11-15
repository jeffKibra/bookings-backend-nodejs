import { ObjectId } from 'mongodb';
import { startSession } from 'mongoose';
//
import { Customer, OpeningBalance } from '../utils';

import { getAllAccounts } from '../../../utils/accounts';
import { isAuthenticated } from '../../../utils/auth';

import { IContactFromDb, IContact } from '../../../../../types';

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
    const accounts = await getAllAccounts(orgId);

    const customerInstance = new Customer(session, orgId, userUID, customerId);
    const [customer] = await Promise.all([
      customerInstance.fetchCurrentCustomer(),
    ]);
    const {
      openingBalance: {
        amount: currentAmount,
        transactionId: currentInvoiceId,
      },
    } = customer;

    if (amount === currentAmount) {
      return;
    }

    let invoiceId = currentInvoiceId;

    if (!invoiceId) {
      invoiceId = new ObjectId().toString();
    }

    const obInstance = new OpeningBalance(session, {
      invoiceId,
      orgId,
      userId: userUID,
    });

    const customerDataSummary = Customer.createCustomerSummary(
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
      await obInstance.create(obInvoice);
    } else {
      if (!currentInvoiceId) {
        throw new Error('Opening balance id not found!');
      }

      const currentInvoice = await obInstance.getCurrentInvoice();

      if (isUpdate) {
        await obInstance.update(obInvoice);
      } else if (isDelete && currentInvoice) {
        await obInstance.delete(currentInvoice);
      } else {
        throw new Error('Invalid current opening balance!');
      }
    }

    //update customer
    updatedCustomer = await customerInstance.updateOpeningBalance(
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

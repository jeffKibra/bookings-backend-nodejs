import { ObjectId } from 'mongodb';
import { startSession } from 'mongoose';

import { IContactForm, IContactGroup } from '../../../types';

import { Contact } from './utils';

//------------------------------------------------------------

async function create(
  userUID: string,
  orgId: string,
  formData: IContactForm,
  group: IContactGroup
) {
  const openingBalance = formData?.openingBalance;
  if (openingBalance < 0) {
    throw new Error('Opening Balance cannot be a negative number');
  }

  const session = await startSession();
  session.startTransaction();

  try {
    const contactId = new ObjectId().toString();

    const contact = new Contact(session, orgId, userUID, contactId);

    const result = await contact.create(formData, group);

    //create contact
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

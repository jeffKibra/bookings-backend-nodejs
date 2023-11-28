import { IContactForm } from '../../../types';

import { Contact } from './utils';

//------------------------------------------------------------

async function update(
  userUID: string,
  orgId: string,
  customerId: string,
  formData: IContactForm
) {
  try {
    const contact = new Contact(null, orgId, userUID, customerId);

    //create customer
    const updatedContact = await contact.update(formData);

    return updatedContact;
  } catch (err) {
    const error = err as Error;
    console.log(error);
    throw err;
  }
}

export default update;

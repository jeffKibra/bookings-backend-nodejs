// import { ObjectId } from 'mongodb';
//
import { ContactModel } from '../../models';
import { Contact } from './utils';
//

export function getById(contactId: string) {
  if (!contactId) {
    throw new Error('Invalid Params: Errors in params [contactId]!');
  }

  return Contact.getById(contactId);

  // console.log('fetching vehicle for id ' + contactId);
}

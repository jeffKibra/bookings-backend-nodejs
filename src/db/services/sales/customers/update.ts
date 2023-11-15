import { IContactForm } from '../../../../types';

import { Customer } from './utils';

//------------------------------------------------------------

async function update(
  userUID: string,
  orgId: string,
  customerId: string,
  formData: IContactForm
) {
  try {
    const customer = new Customer(null, orgId, userUID, customerId);

    //create customer
    const updatedCustomer = await customer.update(formData);

    return updatedCustomer;
  } catch (err) {
    const error = err as Error;
    console.log(error);
    throw err;
  }
}

export default update;

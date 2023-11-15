import { Customer } from './utils';

//------------------------------------------------------------

async function deleteCustomer(
  orgId: string,
  userUID: string,
  customerId: string
) {
  // if (customerId === Customer.walkInCustomer.id) {
  //   throw new functions.https.HttpsError(
  //     'aborted',
  //     'You cannot delete a system customer!'
  //   );
  // }

  try {
    await Customer.validateDelete(orgId, customerId);

    const customer = new Customer(null, orgId, userUID, customerId);

    await customer.delete();
  } catch (err) {
    const error = err as Error;
    console.log(error);
    throw err;
  }
}

export default deleteCustomer;

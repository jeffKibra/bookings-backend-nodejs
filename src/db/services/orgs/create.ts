import {
  generateAccounts,
  accountTypes,
  paymentTerms,
  paymentModes,
} from '../../../constants';

import { userHasOrg } from './utils';

import { IOrgForm } from '../../../types';

//------------------------------------------------------------

async function create (userUID:string, formData: IOrgForm, ) {

    try {

      await userHasOrg(userUID);

      await createOrg(userUID, formData);
    } catch (err) {
      const error = err as Error;
      console.log(error);
      throw err
    }
  }
);

export default create;

async function createOrg(userId: string, orgData: IOrgForm) {
  const orgRef = db.collection('organizations').doc();
  const accountsRef = orgRef.collection('orgDetails').doc('accounts');
  const accountTypesRef = orgRef.collection('orgDetails').doc('accountTypes');
  const paymentModesRef = orgRef.collection('orgDetails').doc('paymentModes');
  const paymentTermsRef = orgRef.collection('orgDetails').doc('paymentTerms');

  const orgId = orgRef.id;

  const batch = db.batch();

  OrgSummary.createWithBatch(batch, orgId);

  const accounts = generateAccounts();
  batch.set(accountsRef, {
    ...accounts,
  });

  batch.set(accountTypesRef, {
    ...accountTypes,
  });

  batch.set(paymentModesRef, {
    ...paymentModes,
  });

  batch.set(paymentTermsRef, {
    ...paymentTerms,
  });

  //create vat tax
  createVAT(batch, orgId, userId);
  //create walk in customer
  Customer.createWalkInCustomer(batch, orgId, userId);
  //create street vendor
  Vendor.createStreetVendor(batch, orgId, userId);
  //create org
  batch.set(orgRef, {
    ...orgData,
    status: 0,
    createdBy: userId,
    modifiedBy: userId,
    createdAt: serverTimestamp(),
    modifiedAt: serverTimestamp(),
  });

  await batch.commit();

  return orgId;
}

function createVAT(batch: WriteBatch, orgId: string, userId: string) {
  const vatDocRef = db.collection(`organizations/${orgId}/taxes`).doc();
  batch.set(vatDocRef, {
    name: 'VAT',
    rate: 16,
    createdBy: userId,
    updatedBy: userId,
    createdAt: serverTimestamp(),
    modifiedAt: serverTimestamp(),
    status: 0,
  });
}

// const summary = {
//   invoices: 0,
//   payments: 0,
//   items: 0,
//   customers: 0,
//   invoicesTotal: 0,
//   paymentsTotal: 0,
//   deletedInvoices: 0,
//   deletedPayments: 0,
//   paymentModes: Object.keys(paymentModes).reduce((modes, key) => {
//     return { ...modes, [key]: 0 };
//   }, {}),
//   accounts: Object.keys(accounts).reduce((accountsSummary, key) => {
//     return {
//       ...accountsSummary,
//       [key]: 0,
//     };
//   }, {}),
//   createdAt: serverTimestamp(),
//   createdBy: userId,
//   modifiedAt: serverTimestamp(),
//   modifiedBy: userId,
// };

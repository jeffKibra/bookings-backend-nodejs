import { ObjectId } from 'mongodb';
import { OrgModel } from '../../models';

import { userHasOrg } from './utils';
//
import { paymentTerms, paymentModes } from '../../../constants';

import { IOrgForm } from '../../../types';

//------------------------------------------------------------

async function create(userUID: string, formData: IOrgForm) {
  try {
    await userHasOrg(userUID);

    const timestamp = new Date().toISOString();

    const metaData = {
      createdBy: userUID,
      modifiedBy: userUID,
      createdAt: timestamp,
      modifiedAt: timestamp,
      status: 0,
    };

    const orgId = new ObjectId();
    const orgIdString = orgId.toString();

    const createdOrg = await OrgModel.findByIdAndUpdate(
      orgIdString,
      {
        $set: {
          ...formData,
          _id: orgId,
          taxes: [
            {
              name: 'VAT',
              rate: 16,
              metaData,
            },
          ],
          paymentTerms: Object.values(paymentTerms).map(paymentTerm => ({
            ...paymentTerm,
            metaData,
          })),
          paymentModes: Object.values(paymentModes).map(paymentMode => ({
            ...paymentMode,
            metaData,
          })),
          metaData,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return createdOrg;
  } catch (err) {
    const error = err as Error;
    console.log(error);
    throw err;
  }
}

export default create;

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

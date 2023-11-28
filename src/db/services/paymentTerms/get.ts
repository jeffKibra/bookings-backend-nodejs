import { getById as getOrgById } from '../orgs/utils';

//
import { IPaymentTermSummary } from '../../../types';
//

export async function getPaymentTermByValue(orgId: string, value: string) {
  const org = await getOrgById(orgId);

  const paymentTerms = org?.paymentTerms || [];
  const paymentTerm = paymentTerms.find(term => term.value === value);
  if (!paymentTerm) {
    throw new Error(`${value} Payment term not found!`);
  }

  const { _id, days, name } = paymentTerm;

  const summary: IPaymentTermSummary = {
    _id,
    days,
    name,
  };

  return summary;
}

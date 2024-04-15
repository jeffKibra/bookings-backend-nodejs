//
import getResult from './getResult';
//
import { IInvoicesQueryOptions } from '../../../../../types';
//

export default async function list(
  orgId: string,
  options?: IInvoicesQueryOptions
) {
  console.log('list invoices options', options);
  const pagination = options?.pagination;
  // console.log('pagination', pagination);

  // aggregation to fetch items not booked.
  const result = await getResult(orgId, options);
  console.log('result', result);

  const { invoices, meta: resultMeta } = result[0];
  const meta = resultMeta || { facets: {} };

  // invoices.forEach(invoice => {
  //   const { _id, payments } = invoice;
  //   console.log('invoiceId', _id);
  //   console.log('payments', payments);
  // });
  console.log('searched invoices', invoices);
  console.log('meta', meta);

  const page = pagination?.page || 0;

  return {
    list: invoices,
    meta: {
      ...meta,
      page,
    },
  };
}

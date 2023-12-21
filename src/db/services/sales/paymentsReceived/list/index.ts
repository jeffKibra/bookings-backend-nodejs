//
import getResult from './getResult';
//
import { IPaymentsReceivedQueryOptions } from '../../../../../types';
//

export default async function list(
  orgId: string,
  options?: IPaymentsReceivedQueryOptions
) {
  console.log('list paymentsReceived options', options);
  const pagination = options?.pagination;
  // console.log('pagination', pagination);

  const requestedPage = pagination?.page || 0;

  const filtersIsEmpty = Object.keys(options?.filters || {}).length === 0;
  const retrieveFacets = requestedPage === 0 && filtersIsEmpty;
  // console.log({ retrieveFacets, requestedPage, filtersIsEmpty });

  // aggregation to fetch items not booked.
  const result = await getResult(orgId, options, retrieveFacets);
  console.log('result', result);

  const { paymentsReceived, meta: resultMeta } = result[0];
  const meta = resultMeta || { facets: {} };

  // paymentsReceived.forEach(invoice => {
  //   const { _id, payments } = invoice;
  //   console.log('invoiceId', _id);
  //   console.log('payments', payments);
  // });
  console.log('listed paymentsReceived', paymentsReceived);
  console.log('meta', meta);

  const page = pagination?.page || 0;

  return {
    list: paymentsReceived,
    meta: {
      ...meta,
      page,
    },
  };
}

//
import getResult from './getResult';
//
import { ISearchContactsQueryOptions } from '../../../../types';
//

interface INumRange {
  min: number;
  max: number;
}

export default async function search(
  orgId: string,
  query: string | number,
  options?: ISearchContactsQueryOptions
) {
  const pagination = options?.pagination;
  // console.log('pagination', pagination);

  // aggregation to fetch items not booked.
  const result = await getResult(orgId, query, options);
  // console.log('result', result);

  const { contacts, meta: resultMeta } = result[0];
  const meta = resultMeta || { facets: {} };

  console.log('searched contacts', contacts);
  console.log('meta', meta);

  const page = pagination?.page || 0;

  return {
    contacts,
    meta: {
      ...meta,
      page,
    },
  };
}

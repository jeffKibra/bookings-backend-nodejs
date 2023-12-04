//
import getResult from './getResult';
//
import { ISearchContactsQueryOptions } from '../../../../types';
//

export default async function search(
  orgId: string,
  query: string | number,
  contactGroup: string
) {
  // aggregation to fetch items not booked.
  const result = await getResult(orgId, query, contactGroup);
  console.log('result', result);

  return result;
}

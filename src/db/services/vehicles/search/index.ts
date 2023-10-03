//
import getResult from './getResult';
//
import { ISearchVehiclesQueryOptions } from '../../../../types';
//

interface INumRange {
  min: number;
  max: number;
}

type ISortByCountFacetCategory = Record<string, string | number>;

export default async function search(
  orgId: string,
  query: string | number,
  options?: ISearchVehiclesQueryOptions
) {
  const pagination = options?.pagination;
  // console.log('pagination', pagination);

  // aggregation to fetch items not booked.
  const result = await getResult(orgId, query, options);
  // console.log('result', result);

  const { vehicles, meta } = result[0];

  // console.log('vehicles', vehicles);
  console.log('meta', meta);
  const { facets } = meta;
  console.log('facets', facets);

  const page = pagination?.page || 0;

  return {
    vehicles,
    meta: {
      ...meta,
      page,
    },
  };
}

//
import getResult from './getResult';
//
import {
  ISearchVehiclesQueryOptions,
  ICountFacet,
  IVehicleMakeFacet,
} from '../../../../types';
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

  const requestedPage = options?.pagination?.page || 0;

  const filtersIsEmpty = Object.keys(options?.filters || {}).length === 0;
  const retrieveFacets = requestedPage === 0 && filtersIsEmpty;
  // console.log({ retrieveFacets, requestedPage, filtersIsEmpty });

  // aggregation to fetch items not booked.
  const result = await getResult(orgId, query, options, retrieveFacets);
  // console.log('result', result);

  const { vehicles, meta: resultMeta } = result[0];
  const meta = resultMeta || { facets: {} };

  // console.log('searched vehicles', vehicles);
  console.log('meta', meta);

  const page = pagination?.page || 0;

  return {
    list: vehicles,
    meta: {
      ...meta,
      page,
    },
  };
}

//
import getResult from './getResult';
//
import {
  ISearchBookingsQueryOptions,
  ICountFacet,
  IVehicleMakeFacet,
  IBookingAggregationFacets,
} from '../../../../../types';
//

interface INumRange {
  min: number;
  max: number;
}

export default async function search(
  orgId: string,
  query: string | number,
  options?: ISearchBookingsQueryOptions
) {
  const pagination = options?.pagination;
  // console.log('pagination', pagination);

  const requestedPage = options?.pagination?.page || 0;

  const filtersIsEmpty = Object.keys(options?.filters || {}).length === 0;
  const retrieveFacets = requestedPage === 0 && filtersIsEmpty;
  // console.log({ retrieveFacets, requestedPage, filtersIsEmpty });

  // aggregation to fetch items not booked.
  const result = await getResult(orgId, query, options, retrieveFacets);
  console.log('result', result);

  const { bookings, meta: resultMeta } = result[0];
  const meta = resultMeta || { facets: {} };

  console.log('searched bookings', bookings);
  console.log('meta', meta);
  const { facets: aggregationFacets, ...moreMetaOptions } = meta;
  // console.log('facets', facets);

  const facets = formatFacets(aggregationFacets);

  // console.log('formattedMakes: ', formattedMakes);

  const page = pagination?.page || 0;

  return {
    bookings,
    meta: {
      ...moreMetaOptions,
      page,
      ...(retrieveFacets
        ? {
            facets,
          }
        : {}),
    },
  };
}

function formatFacets(aggregationFacets: IBookingAggregationFacets) {
  if (!aggregationFacets) {
    return null;
  }

  const {
    makes: makesFacet,
    models: modelsFacet,
    ...moreFacets
  } = aggregationFacets;

  // console.log('models', modelsFacet);
  // console.log('makes', makesFacet);

  const modelsFacetObject: Record<string, ICountFacet> = {};

  if (Array.isArray(modelsFacet)) {
    modelsFacet.forEach(modelFacet => {
      const { _id } = modelFacet;
      modelsFacetObject[_id] = modelFacet;
    });
  }

  // console.log('models facet object', modelsFacetObject);

  const formattedMakes: IVehicleMakeFacet[] = [];

  if (Array.isArray(makesFacet)) {
    makesFacet.forEach(makeFacet => {
      const { models: modelsIds, ...makeFacetData } = makeFacet;

      const makeModels: ICountFacet[] = [];

      modelsIds.forEach(modelId => {
        const modelFacetData = modelsFacetObject[modelId];

        makeModels.push(modelFacetData);
      });

      formattedMakes.push({
        ...makeFacetData,
        models: makeModels,
      });
    });
  }

  const facets = {
    ...moreFacets,
    makes: formattedMakes,
  };

  return facets;
}

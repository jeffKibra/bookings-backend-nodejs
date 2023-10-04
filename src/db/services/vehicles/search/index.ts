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

  // aggregation to fetch items not booked.
  const result = await getResult(orgId, query, options);
  // console.log('result', result);

  const { vehicles, meta } = result[0];

  // console.log('vehicles', vehicles);
  console.log('meta', meta);
  const facets = meta?.facets || {};
  console.log('facets', facets);
  const { makes: makesFacet, models: modelsFacet, ...moreFacets } = facets;

  console.log('makes', makesFacet);

  const modelsFacetObject: Record<string, ICountFacet> = {};

  if (Array.isArray(modelsFacet)) {
    modelsFacet.forEach(modelFacet => {
      const { _id } = modelFacet;
      modelsFacetObject[_id] = modelFacet;
    });
  }

  console.log('models facet object', modelsFacetObject);

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

  console.log('formattedMakes: ', formattedMakes);

  const page = pagination?.page || 0;

  return {
    vehicles,
    meta: {
      ...meta,
      facets: {
        ...moreFacets,
        makes: formattedMakes,
      },
      page,
    },
  };
}

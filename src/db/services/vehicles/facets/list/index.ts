//
import getResult from './getResult';
//
import {
  ISearchVehiclesQueryOptions,
  ICountFacet,
  IVehicleMakeFacet,
} from '../../../../../types';
//

interface INumRange {
  min: number;
  max: number;
}

type ISortByCountFacetCategory = Record<string, string | number>;

export default async function search(orgId: string) {
  // aggregation to fetch items not booked.
  const result = await getResult(orgId);
  // console.log('result', result);

  const { facets } = result[0];

  //   console.log('facets', facets);
  //   console.log('count', count);
  // console.log('facets', facets);
  const { makes: makesFacet, models: modelsFacet, ...moreFacets } = facets;

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

  // console.log('formattedMakes: ', formattedMakes);

  return {
    ...moreFacets,
    makes: formattedMakes,
  };
}

import { VehicleModel } from '../../../models';
//
import {
  generateSearchStages,
  generateAvailableVehiclesStages,
  generateSortAndPaginateStages,
} from './subPipelines';
import { generateLimit } from './utils';
//
import {
  IVehicle,
  ISearchMeta,
  ISearchVehiclesQueryOptions,
} from '../../../../types';
//

interface INumRange {
  min: number;
  max: number;
}

type ISortByCountFacetCategory = Record<string, string | number>;
type ISortByCountFacetCategories = ISortByCountFacetCategory[];

export default async function search(
  orgId: string,
  query: string | number,
  options?: ISearchVehiclesQueryOptions
) {
  const pagination = options?.pagination;
  console.log('pagination', pagination);
  const filters = options?.filters;

  const searchPipelineStages = generateSearchStages(
    orgId,
    query,
    filters,
    true
  );
  const availableVehiclesPipelineStages = generateAvailableVehiclesStages(
    orgId,
    options?.selectedDates || []
  );
  const sortAndPaginateStages = generateSortAndPaginateStages(pagination);
  const limit = generateLimit(pagination);

  // aggregation to fetch items not booked.
  const result = await VehicleModel.aggregate<{
    vehicles: IVehicle[];
    meta: ISearchMeta;
  }>([
    ...searchPipelineStages,
    ...sortAndPaginateStages,
    {
      $facet: {
        /**
         * if some methods in facetPipeline not possible,
         * unwind vehicles and use later in the main pipeline
         */
        vehicles: [
          ...availableVehiclesPipelineStages,
          {
            //limit items returned
            $limit: limit,
          },
        ],
        ratesRange: [
          {
            $group: {
              _id: null,
              max: { $max: '$rate' },
              min: { $min: '$rate' },
            },
          },
        ],
        meta: [
          {
            //must be used before a lookup
            $replaceWith: {
              $mergeObjects: '$$SEARCH_META',
            },
          },
          {
            $limit: 1,
          },
        ],
      },
    },
    {
      //change meta field from array to object
      $set: {
        meta: { $arrayElemAt: ['$meta', 0] },
      },
    },

    {
      //format metadata
      $project: {
        vehicles: 1,
        meta: {
          count: '$meta.count.lowerBound',
          facets: {
            $mergeObjects: [
              {
                makesFacet: [],
                modelsFacet: [],
                typesFacet: [],
                colorsFacet: [],
                ratesRangeFacet: {},
              },
              {
                makesFacet: '$meta.facet.makesFacet.buckets',
                modelsFacet: '$meta.facet.modelsFacet.buckets',
                typesFacet: '$meta.facet.typesFacet.buckets',
                colorsFacet: '$meta.facet.colorsFacet.buckets',
                ratesRangeFacet: {
                  $arrayElemAt: ['$ratesRange', 0],
                },
              },
            ],
          },
        },
      },
    },

    // ...availableVehiclesPipelineStages,
    // {
    //   $sort: {
    //     registration: -1,
    //   },
    // },
  ]);
  console.log('result', result);

  const { vehicles, meta } = result[0];

  // console.log('vehicles', vehicles);
  console.log('meta', meta);
  const { facets } = meta;
  console.log('facets', facets);

  const currentPage = pagination?.currentPage || 0;
  return {
    vehicles,
    meta: {
      ...meta,
      page: currentPage + 1,
    },
  };
}

import { VehicleModel } from '../../../models';
//
import {
  generateSearchStages,
  generateAvailableVehiclesStages,
} from './subPipelines';
import { generateLimit } from './utils';
//
import {
  IVehicle,
  ISearchMeta,
  ISearchVehiclesQueryOptions,
} from '../../../../types';
//

export default async function getResult(
  orgId: string,
  query: string | number,
  options?: ISearchVehiclesQueryOptions
) {
  const sortBy = options?.sortBy || { field: 'searchScore', direction: 'desc' };
  const sortByField = sortBy.field;
  const sortByDirection = sortBy.direction === 'asc' ? 1 : -1;

  const pagination = options?.pagination;
  //   console.log('pagination', pagination);
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

  const page = pagination?.page || 0;
  const limit = generateLimit(pagination);
  const offset = Number(page) * limit;
  //   console.log({ offset, limit, page });

  // aggregation to fetch items not booked.
  return VehicleModel.aggregate<{
    vehicles: IVehicle[];
    meta: ISearchMeta;
  }>([
    ...searchPipelineStages,
    {
      $sort: {
        [sortByField]: sortByDirection,
        _id: sortByDirection,
      },
    },
    {
      $skip: offset,
    },
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
  ]);
}

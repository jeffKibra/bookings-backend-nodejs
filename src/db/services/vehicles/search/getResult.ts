import { PipelineStage } from 'mongoose';
import { VehicleModel } from '../../../models';
//
import {
  generateSearchStages,
  generateAvailableVehiclesStages,
} from './subPipelines';
//
import { sort, pagination } from '../../utils';

//
import {
  IVehicle,
  IVehicleSearchAggregationMeta,
  ISearchVehiclesQueryOptions,
} from '../../../../types';
//

type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------
const unwindAvailableVehiclesStages: FacetPipelineStage[] = [
  {
    $project: {
      availableVehicles: 1,
    },
  },
  {
    $unwind: '$availableVehicles',
  },
  {
    $replaceWith: '$availableVehicles',
  },
];

//
const { generateLimit } = pagination;
const { generateSortBy } = sort;

//----------------------------------------------------------------

export default async function getResult(
  orgId: string,
  query: string | number,
  options?: ISearchVehiclesQueryOptions,
  retrieveFacets?: boolean
) {
  const [sortByField, sortByDirection] = generateSortBy(query, options?.sortBy);

  const pagination = options?.pagination;
  //   console.log('pagination', pagination);
  const filters = options?.filters;

  const searchPipelineStages = generateSearchStages(
    orgId,
    query,
    filters,
    retrieveFacets
  );
  const availableVehiclesPipelineStages = generateAvailableVehiclesStages(
    orgId,
    options?.selectedDates || [],
    options?.bookingId || ''
  );

  console.log(
    'availableVehiclesPipelineStages',
    availableVehiclesPipelineStages
  );

  const page = pagination?.page || 0;
  const limit = generateLimit(pagination);
  const offset = Number(page) * limit;
  //   console.log({ offset, limit, page });

  // aggregation to fetch items not booked.
  return VehicleModel.aggregate<{
    vehicles: IVehicle[];
    meta: IVehicleSearchAggregationMeta;
    count: Record<string, unknown>;
  }>([
    ...searchPipelineStages,
    {
      $sort: {
        [sortByField]: sortByDirection,
        _id: sortByDirection,
      },
    },
    // {
    //   $skip: offset,
    // },
    {
      $facet: {
        availableVehicles: [...availableVehiclesPipelineStages],
        makes: [
          {
            $group: {
              _id: '$make',
              count: { $sum: 1 },
              models: {
                $addToSet: '$model.model',
              },
              years: {
                $addToSet: '$year',
              },
            },
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
      $facet: {
        vehicles: [
          ...unwindAvailableVehiclesStages,
          {
            $skip: offset,
          },
          {
            //limit items returned
            $limit: limit,
          },
        ],
        info: [
          {
            $project: {
              count: {
                $size: '$availableVehicles',
              },
              makes: 1,
              ratesRange: 1,
              meta: 1,
            },
          },
        ],
      },
    },
    {
      //restructure for all fields to be in root doc
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ['$info', 0] }, '$$ROOT'],
        },
      },
    },
    {
      $project: {
        info: 0,
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
          countForSearches: '$meta.count.lowerBound',
          count: '$count',
          facets: {
            $mergeObjects: [
              {
                makes: [],
                models: [],
                types: [],
                colors: [],
                ratesRange: {},
              },
              {
                // makes: '$meta.facet.makesFacet.buckets',
                // models: '$meta.facet.modelsFacet.buckets',
                makes: '$makes',
                models: '$meta.facet.modelsFacet.buckets',
                types: '$meta.facet.typesFacet.buckets',
                colors: '$meta.facet.colorsFacet.buckets',
                ratesRange: {
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

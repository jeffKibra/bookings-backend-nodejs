import { PipelineStage } from 'mongoose';
import { VehicleModel } from '../../../models';
//
import {
  generateSearchStages,
  generateAvailableVehiclesStages,
} from './subPipelines';
//
import { sort, pagination } from '../../utils';
// import { Filters } from './utils/filters';
import { VehiclesFilters } from '../../utils/filters';

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

function generateOptions(
  orgId: string,
  query: string | number,
  options?: ISearchVehiclesQueryOptions
) {
  const [sortByField, sortByDirection] = generateSortBy(query, options?.sortBy);

  const pagination = options?.pagination;
  //   console.log('pagination', pagination);
  const filters = options?.filters;

  //
  const { matchFilters, searchFilters } = new VehiclesFilters(
    orgId
  ).generateFilters(query, filters);

  const searchPipelineStages = searchFilters
    ? generateSearchStages(query, searchFilters)
    : [];

  const matchPipelineStage: FacetPipelineStage = {
    $match: {
      ...matchFilters,
    },
  };

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

  return {
    page,
    limit,
    offset,
    availableVehiclesPipelineStages,
    searchPipelineStages,
    matchPipelineStage,
    sortByField,
    sortByDirection,
  };
}

//----------------------------------------------------------------

export default async function getResult(
  orgId: string,
  query: string | number,
  options?: ISearchVehiclesQueryOptions
) {
  const {
    availableVehiclesPipelineStages,
    searchPipelineStages,
    matchPipelineStage,
    limit,
    offset,
    page,
    sortByDirection,
    sortByField,
  } = generateOptions(orgId, query, options);

  // aggregation to fetch items not booked.
  return VehicleModel.aggregate<{
    vehicles: IVehicle[];
    meta: IVehicleSearchAggregationMeta;
    count: Record<string, unknown>;
  }>([
    ...(query ? searchPipelineStages : [matchPipelineStage]),
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
        vehicles: [
          ...availableVehiclesPipelineStages,
          {
            $skip: offset,
          },
          {
            //limit items returned
            $limit: limit,
          },
        ],
        meta: [
          {
            $count: 'count',
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
  ]);
}

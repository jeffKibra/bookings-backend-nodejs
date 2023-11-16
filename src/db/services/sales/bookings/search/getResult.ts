import { PipelineStage } from 'mongoose';
import { BookingModel, InvoiceModel } from '../../../../models';
//
import { generateSearchStages } from './subPipelines';
import { pagination, sort } from '../../../utils';
//
import {
  IBooking,
  IBookingSearchAggregationMeta,
  ISearchBookingsQueryOptions,
} from '../../../../../types';
//

// type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------

const { generateSortBy } = sort;
const { generateLimit } = pagination;
//----------------------------------------------------------------

export default async function getResult(
  orgId: string,
  query: string | number,
  options?: ISearchBookingsQueryOptions,
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

  const page = pagination?.page || 0;
  const limit = generateLimit(pagination);
  const offset = Number(page) * limit;
  console.log({ offset, limit, page });

  // aggregation to fetch items not booked.
  return InvoiceModel.aggregate<{
    bookings: IBooking[];
    meta: IBookingSearchAggregationMeta;
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
        bookings: [
          {
            //limit items returned
            $limit: limit,
          },
        ],
        // makes: [
        //   {
        //     $group: {
        //       _id: '$make',
        //       count: { $sum: 1 },
        //       models: {
        //         $addToSet: '$model.model',
        //       },
        //       years: {
        //         $addToSet: '$year',
        //       },
        //     },
        //   },
        // ],
        // ratesRange: [
        //   {
        //     $group: {
        //       _id: null,
        //       max: { $max: '$rate' },
        //       min: { $min: '$rate' },
        //     },
        //   },
        // ],
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
        bookings: 1,
        meta: {
          count: '$meta.count.lowerBound',
          // facets: {
          //   $mergeObjects: [
          //     {
          //       makes: [],
          //       models: [],
          //       types: [],
          //       colors: [],
          //       ratesRange: {},
          //     },
          //     {
          //       makes: '$makes',
          //       models: '$meta.facet.modelsFacet.buckets',
          //       types: '$meta.facet.typesFacet.buckets',
          //       colors: '$meta.facet.colorsFacet.buckets',
          //       ratesRange: {
          //         $arrayElemAt: ['$ratesRange', 0],
          //       },
          //     },
          //   ],
          // },
        },
      },
    },
  ]);
}

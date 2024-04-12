import { PipelineStage } from 'mongoose';
import { ContactModel } from '../../../models';

//
import { generateSearchStages, transformDocFields } from './subPipelines';
//
import { sort, pagination, filters } from '../../utils';

//
import { IContact, ISearchContactsQueryOptions } from '../../../../types';
//

type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------

//
const { generateLimit } = pagination;
const { generateSortBy } = sort;
const { ContactsFilters } = filters;

//----------------------------------------------------------------

function generateAggregationOptions(
  orgId: string,
  query: string | number,
  options?: ISearchContactsQueryOptions
) {
  // console.log('options', options);
  const [sortByField, sortByDirection] = generateSortBy(query, options?.sortBy);

  const pagination = options?.pagination;
  //   console.log('pagination', pagination);
  const rawFilters = options?.filters || {};
  const group = options?.group || '';
  const userFilters = {
    ...rawFilters,
    group: [group],
  };

  const { matchFilters, searchFilters } = new ContactsFilters(
    orgId
  ).generateFilters(query, userFilters);

  // const searchPipelineStages = searchFilters
  //   ? generateSearchStages(query, searchFilters)
  //   : [];
  const searchPipelineStages = searchFilters
    ? generateSearchStages(query, searchFilters)
    : [];

  const matchPipelineStage: FacetPipelineStage = {
    $match: {
      ...matchFilters,
    },
  };

  const page = pagination?.page || 0;
  const limit = generateLimit(pagination);
  const offset = Number(page) * limit;
  //   console.log({ offset, limit, page });

  return {
    sortByField,
    sortByDirection,
    searchPipelineStages,
    matchPipelineStage,
    limit,
    offset,
  };
}

//----------------------------------------------------------------

export default async function getResult(
  orgId: string,
  query: string | number,
  options?: ISearchContactsQueryOptions
) {
  const {
    searchPipelineStages,
    matchPipelineStage,
    sortByField,
    sortByDirection,
    offset,
    limit,
  } = generateAggregationOptions(orgId, query, options);

  // console.log({ query, searchPipelineStages, matchPipelineStage });

  // aggregation to fetch items not booked.
  return ContactModel.aggregate<{
    contacts: IContact[];
    meta: { count: number };
  }>([
    ...(query ? searchPipelineStages : [matchPipelineStage]),
    {
      $sort: {
        [sortByField]: sortByDirection,
        _id: sortByDirection,
      },
    },

    {
      $facet: {
        contacts: [
          //if match is activated, prevents returning newly created docs as well.
          // {
          //   $match: {
          //     'metaData.status': 0,
          //   },
          // },
          {
            $skip: offset,
          },
          {
            //limit items returned
            $limit: limit,
          },
          {
            //modify the fields of only the docs to return
            $set: {
              ...transformDocFields,
            },
          },
        ],
        meta: [
          {
            $count: 'count',
          },
        ],
        // meta: [
        //   {
        //     //must be used before a lookup
        //     $replaceWith: {
        //       $mergeObjects: '$$SEARCH_META',
        //     },
        //   },
        //   {
        //     $limit: 1,
        //   },
        // ],
      },
    },
    {
      //change meta field from array to object
      $set: {
        meta: { $arrayElemAt: ['$meta', 0] },
      },
    },
    // {
    //   //format metadata
    //   $project: {
    //     contacts: 1,
    //     meta: {
    //       count: '$meta.count.lowerBound',
    //     },
    //   },
    // },
  ]);
}

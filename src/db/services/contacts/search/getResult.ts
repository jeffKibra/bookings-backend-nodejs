import { PipelineStage } from 'mongoose';
import { ContactModel } from '../../../models';
//
import { generateSearchStages } from './subPipelines';
//
import { sort, pagination } from '../../utils';

//
import { IContact, ISearchContactsQueryOptions } from '../../../../types';
//

type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------

//
const { generateLimit } = pagination;
const { generateSortBy } = sort;

//----------------------------------------------------------------

export default async function getResult(
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
  const filters = {
    ...rawFilters,
    group: [group],
  };

  const searchPipelineStages = generateSearchStages(orgId, query, filters);

  const page = pagination?.page || 0;
  const limit = generateLimit(pagination);
  const offset = Number(page) * limit;
  //   console.log({ offset, limit, page });

  // aggregation to fetch items not booked.
  return ContactModel.aggregate<{
    contacts: IContact[];
    meta: { count: number };
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
        contacts: [
          //if match is activated, prevents returning newly created docs as well.
          // {
          //   $match: {
          //     'metaData.status': 0,
          //   },
          // },
          {
            //limit items returned
            $limit: limit,
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
        contacts: 1,
        meta: {
          count: '$meta.count.lowerBound',
        },
      },
    },
  ]);
}

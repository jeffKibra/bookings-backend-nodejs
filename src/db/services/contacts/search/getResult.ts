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
  const [sortByField, sortByDirection] = generateSortBy(query, options?.sortBy);

  const pagination = options?.pagination;
  //   console.log('pagination', pagination);
  const filters = options?.filters;

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

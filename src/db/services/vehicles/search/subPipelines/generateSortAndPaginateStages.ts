import { PipelineStage } from 'mongoose';
import { ObjectId } from 'mongodb';
//
//
import {
  IPaginationParams,
  IPaginationCursor,
  ISortBy,
} from '../../../../../types';

// function generateFirstSortField(sortOptions?: ISortOptions) {
//   const sortDirection =
//     String(sortOptions?.direction).toLowerCase() === 'desc' ? -1 : 1;
//   const sortField = String(sortOptions?.field || '');

//   const firstSortField = sortField
//     ? { [sortField]: sortDirection } //only registration or rate allowed for sorting
//     : { unused: { $meta: 'searchScore' } }; //sorts by search score(defaults to desc)
//   console.log({ firstSortField });

//   return firstSortField;
// }

type ISortFields = Record<string, 1 | -1>;

export default function generateSortAndPaginateStages(
  sortBy: ISortBy,
  pagination?: IPaginationParams
  // sortOptions?: ISortOptions
) {
  // const paginationFoward = options instanceof IPaginationFoward;
  const sortByField = sortBy.field;
  const sortByDirection = sortBy.direction === 'asc' ? 1 : -1;

  const stages: PipelineStage[] = [
    {
      $sort: {
        [sortByField]: sortByDirection,
        _id: sortByDirection,
      },
    },
  ];

  return stages;
}

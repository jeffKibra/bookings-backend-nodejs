import { PipelineStage } from 'mongoose';
import { ObjectId } from 'mongodb';
//
import { generatePaginationCursors } from '../utils';
//
import { IPaginationParams } from '../../../../../types';

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

export default function generateSortAndPaginateStages(
  pagination?: IPaginationParams
  // sortOptions?: ISortOptions
) {
  // const paginationFoward = options instanceof IPaginationFoward;

  const { fowardCursor, backwardCursor } =
    generatePaginationCursors(pagination);

  const stages: PipelineStage[] = [
    {
      $addFields: {
        searchScore: {
          $meta: 'searchScore',
        },
      },
    },
    {
      $sort: {
        searchScore: -1,
        _id: -1,
      },
    },
    ...(fowardCursor
      ? [
          {
            $match: {
              // searchScore: { $lte: paginationLastDoc.searchScore }, //was sorted in desc
              _id: { $gt: new ObjectId(fowardCursor._id) }, //was sorted in desc
            },
          },
        ]
      : []),
    ...(backwardCursor
      ? [
          {
            $match: {
              // searchScore: { $lte: paginationLastDoc.searchScore }, //was sorted in desc
              _id: { $gt: new ObjectId(backwardCursor._id) }, //was sorted in desc
            },
          },
        ]
      : []),
  ];

  return stages;
}

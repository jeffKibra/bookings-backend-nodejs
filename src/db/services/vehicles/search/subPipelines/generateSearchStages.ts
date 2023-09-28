import { PipelineStage } from 'mongoose';
import { ObjectId } from 'mongodb';
//
import {
  ISearchVehiclesPagination,
  IPaginationLastDoc,
} from '../../../../../types';

interface ISortOptions {
  field: string;
  direction?: 'desc' | 'asc';
}

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

export default function generateSearchStages(
  orgId: string,
  query: string | number
  // sortOptions?: ISortOptions
) {
  const stages: PipelineStage[] = [
    {
      $search: {
        compound: {
          must: [
            ...(query
              ? [
                  {
                    text: {
                      path: [
                        'registration',
                        'make',
                        'model',
                        'color',
                        'description',
                      ],
                      query,
                      fuzzy: {},
                    },
                  },
                ]
              : []),
          ],
          filter: [
            {
              text: {
                path: 'metaData.orgId',
                query: orgId,
              },
            },
            {
              equals: {
                path: 'metaData.status',
                value: 0,
              },
            },
          ],
        },

        // sort: {
        //   // unused: { $meta: 'searchScore' }, //defaults to desc add order:1 for asc
        //   //then order by _id to ensure docs with similar score are ordered
        //   _id: 1, //desc
        // },
      },
    },
    {
      $addFields: {
        //add searchscore field for sorting in next stages
        searchScore: {
          $meta: 'searchScore',
        },
      },
    },
    // {
    //   $sort: {
    //     searchScore: -1,
    //     _id: -1,
    //   },
    // },
  ];

  return stages;
}

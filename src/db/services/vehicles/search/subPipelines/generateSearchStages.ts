import { PipelineStage } from 'mongoose';
//
import { generateFilters } from '../utils';
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
  query: string | number,
  userFilters?: Record<string, (string | number | Date)[]>,
  retrieveFacets = false
  // sortOptions?: ISortOptions
) {
  const filters = generateFilters(userFilters);
  console.log('filters', filters);

  const compoundOperators = {
    must: [
      ...(query
        ? [
            {
              text: {
                path: [
                  'registration',
                  'make',
                  'model.model',
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
      // {
      //   equals: {
      //     path: 'metaData.deleted',
      //     value: false,
      //   },
      // },
      ...filters,
    ],
  };

  console.log('compound operators', compoundOperators);

  const stages: PipelineStage[] = [
    {
      $search: {
        ...(retrieveFacets
          ? {
              facet: {
                operator: {
                  compound: compoundOperators,
                },
                facets: {
                  // makesFacet: {
                  //   type: 'string',
                  //   path: 'make',
                  // },
                  modelsFacet: {
                    type: 'string',
                    path: 'model.model',
                  },
                  typesFacet: {
                    type: 'string',
                    path: 'model.type',
                  },
                  colorsFacet: {
                    type: 'string',
                    path: 'color',
                  },
                },
              },
            }
          : { compound: compoundOperators }),

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
        id: {
          $toString: '$_id',
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

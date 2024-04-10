import { PipelineStage } from 'mongoose';
//
import { generateFilters } from '../utils/filters';
//
import transformDocFields from './transformDocFields';

export default function generateSearchStages(
  orgId: string,
  query: string | number,
  userFilters?: Record<string, (string | number | Date)[]>,
  retrieveFacets?: false
  // sortOptions?: ISortOptions
) {
  console.log('generate contacts search stages orgId', orgId);
  const filters = generateFilters(orgId, userFilters);
  console.log('filters', filters);

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
                        'displayName',
                        'firstName',
                        'lastName',
                        'companyName',
                        'email',
                        'phone',
                      ],
                      query,
                      fuzzy: {},
                    },
                  },
                ]
              : []),
          ],
          filter: [...filters],
        },

        // sort: {
        //   // unused: { $meta: 'searchScore' }, //defaults to desc add order:1 for asc
        //   //then order by _id to ensure docs with similar score are ordered
        //   _id: 1, //desc
        // },
      },
    },
    {
      $set: {
        //add searchscore field for sorting in next stages
        searchScore: {
          $meta: 'searchScore',
        },
        ...transformDocFields,
        // _id: {
        //   $toString: '$_id',
        // },
        // openingBalance: {
        //   $toDouble: '$openingBalance',
        // },
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

// import { PipelineStage } from 'mongoose';
// //
// import { generateFilters } from '../utils/filters';
// //
// import transformDocFields from './transformDocFields';

// export default function generateSearchStages(
//   orgId: string,
//   query: string | number,
//   userFilters?: Record<string, (string | number | Date)[]>,
//   retrieveFacets?: false
//   // sortOptions?: ISortOptions
// ) {
//   console.log('generate contacts search stages orgId', orgId);
//   const filters = generateFilters(orgId, userFilters);
//   console.log('filters', filters);

//   const compoundOperators = {
//     must: [
//       ...(query
//         ? [
//             {
//               text: {
//                 path: [
//                   'displayName',
//                   'firstName',
//                   'lastName',
//                   'companyName',
//                   'email',
//                   'phone',
//                 ],
//                 query,
//                 fuzzy: {},
//               },
//             },
//           ]
//         : []),
//     ],
//     filter: [...filters],
//   };

//   console.log('compound operators', compoundOperators);

//   const stages: PipelineStage[] = [
//     {
//       $search: {
//         ...(retrieveFacets
//           ? {
//               facet: {
//                 operator: {
//                   compound: compoundOperators,
//                 },
//                 facets: {
//                   // makesFacet: {
//                   //   type: 'string',
//                   //   path: 'make',
//                   // },
//                   typesFacet: {
//                     type: 'string',
//                     path: 'type',
//                   },
//                   contactGroupFacet: {
//                     type: 'string',
//                     path: 'metaData.group',
//                   },
//                   salutationsFacet: {
//                     type: 'string',
//                     path: 'salutation',
//                   },
//                 },
//               },
//             }
//           : { compound: compoundOperators }),

//         // sort: {
//         //   // unused: { $meta: 'searchScore' }, //defaults to desc add order:1 for asc
//         //   //then order by _id to ensure docs with similar score are ordered
//         //   _id: 1, //desc
//         // },
//       },
//     },
//     {
//       $set: {
//         //add searchscore field for sorting in next stages
//         searchScore: {
//           $meta: 'searchScore',
//         },
//         ...transformDocFields,
//         // _id: {
//         //   $toString: '$_id',
//         // },
//         // openingBalance: {
//         //   $toDouble: '$openingBalance',
//         // },
//       },
//     },
//     // {
//     //   $sort: {
//     //     searchScore: -1,
//     //     _id: -1,
//     //   },
//     // },
//   ];

//   return stages;
// }

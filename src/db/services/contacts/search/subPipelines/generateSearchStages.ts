import { PipelineStage } from 'mongoose';
//
import { generateFilters } from '../utils/filters';
//

export default function generateSearchStages(
  orgId: string,
  query: string | number,
  userFilters?: Record<string, (string | number | Date)[]>,
  retrieveFacets?: false
  // sortOptions?: ISortOptions
) {
  const filters = generateFilters(orgId, userFilters);
  console.log('filters', filters);

  const compoundOperators = {
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
                  typesFacet: {
                    type: 'string',
                    path: 'type',
                  },
                  contactTypesFacet: {
                    type: 'string',
                    path: 'metaData.contactType',
                  },
                  salutationsFacet: {
                    type: 'string',
                    path: 'salutation',
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

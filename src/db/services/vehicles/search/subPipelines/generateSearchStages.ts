import { PipelineStage } from 'mongoose';
//
// import { Filters } from '../utils/filters';
import { VehiclesFilters } from '../../../utils/filters';

//

// import {
//   ISearchVehiclesPagination,
//   IPaginationLastDoc,
// } from '../../../../../types';

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
  query: string | number,
  filters: ReturnType<VehiclesFilters['generateSearchFilters']>
  // filters: Record<string, unknown>[]
  // userFilters?: Record<string, (string | number | Date)[]>,
  // sortOptions?: ISortOptions
) {
  // const filtersInstance = new Filters(orgId, String(query), userFilters);
  // const filters = filtersInstance.generateFilters().searchFilters;

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
                        'registration',
                        // 'model.make',
                        // 'model.name',
                        // 'color',
                        // 'description',
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

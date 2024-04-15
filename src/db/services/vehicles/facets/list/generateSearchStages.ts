import { PipelineStage } from 'mongoose';
//
// import { Filters } from '../../../utils/filters';
//

import {
  ISearchVehiclesPagination,
  IPaginationLastDoc,
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

export default function generateSearchStages(
  orgId: string,
  query: string | number,
  filters: Record<string, unknown>[],
  // userFilters?: Record<string, (string | number | Date)[]>,
  retrieveFacets = false
  // sortOptions?: ISortOptions
) {
  // const filtersInstance = new Filters(orgId, String(query), userFilters);
  // const filters = filtersInstance.generateFilters().searchFilters;

  const stages: PipelineStage[] = [
    {
      $searchMeta: {
        facet: {
          facets: {
            makesFacet: {
              type: 'string',
              path: 'model.make',
            },
            modelsFacet: {
              type: 'string',
              path: 'model.name',
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
      },
    },
  ];

  return stages;
}

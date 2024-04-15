import { PipelineStage } from 'mongoose';
//
// import { generateFilters } from '../utils/filters';
import { ContactsFilters } from '../../../utils/filters';
//

export default function generateSearchStages(
  query: string | number,
  filters: ReturnType<ContactsFilters['generateSearchFilters']>
  // sortOptions?: ISortOptions
) {
  console.log('filters', filters);

  const compoundOperators = {
    must: [
      ...(query
        ? [
            {
              autocomplete: {
                path: 'displayName',
                query,
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
        compound: compoundOperators,
      },
    },
    {
      $set: {
        //add searchscore field for sorting in next stages
        searchScore: {
          $meta: 'searchScore',
        },
        _id: {
          $toString: '$_id',
        },
      },
    },
  ];

  return stages;
}

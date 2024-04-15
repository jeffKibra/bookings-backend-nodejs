import { PipelineStage } from 'mongoose';
//
import { InvoicesFilters } from '../../../../utils/filters';
//

// import {
//   ISearchVehiclesPagination,
//   IPaginationLastDoc,
// } from '../../../../../../types';

export default function generateSearchStages(
  orgId: string,
  query: string | number,
  filters: ReturnType<InvoicesFilters['generateSearchFilters']>
  // sortOptions?: ISortOptions
) {
  console.log('filters', filters);

  const compoundOperators = {
    // must: [
    //   ...(query
    //     ? [
    //         {
    //           text: {
    //             path: [
    //               'items.name',
    //               // 'items.details.make',
    //               // 'model.model',
    //               // 'color',
    //               // 'description',
    //             ],
    //             query,
    //             fuzzy: {},
    //           },
    //         },
    //       ]
    //     : []),
    // ],
    filter: [...filters],
  };

  console.log('compound operators', compoundOperators);

  const stages: PipelineStage[] = [
    {
      $search: {
        compound: compoundOperators,

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
    {
      $match: {
        'metaData.status': 0,
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

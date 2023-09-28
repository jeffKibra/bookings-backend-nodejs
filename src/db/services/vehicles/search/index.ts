import { VehicleModel } from '../../../models';
//
import {
  generateSearchStages,
  generateAvailableVehiclesStages,
  generateSortAndPaginateStages,
} from './subPipelines';
import { generateLimit } from './utils';
//
import {
  IVehicle,
  ISearchMeta,
  ISearchVehiclesQueryOptions,
} from '../../../../types';
//

export default async function search(
  orgId: string,
  query: string | number,
  options?: ISearchVehiclesQueryOptions
) {
  const pagination = options?.pagination;
  console.log('pagination', pagination);

  const searchPipelineStages = generateSearchStages(orgId, query);
  const availableVehiclesPipelineStages = generateAvailableVehiclesStages(
    orgId,
    options?.selectedDates || []
  );
  const sortAndPaginateStages = generateSortAndPaginateStages(pagination);
  const limit = generateLimit(pagination);

  // aggregation to fetch items not booked.
  const result = await VehicleModel.aggregate<{
    vehicles: IVehicle[];
    meta: ISearchMeta[];
  }>([
    ...searchPipelineStages,
    ...sortAndPaginateStages,
    {
      $facet: {
        /**
         * if some methods in facetPipeline not possible,
         * unwind vehicles and use later in the main pipeline
         */
        vehicles: [
          ...availableVehiclesPipelineStages,
          {
            //limit items returned
            $limit: limit,
          },
        ],
        meta: [
          // {
          //   //must be used before a lookup
          //   $replaceWith: '$$SEARCH_META',
          // },
          {
            //must be used before a lookup
            $replaceWith: {
              count: '$$SEARCH_META.count.lowerBound',
            },
          },
          {
            $limit: 1,
          },
        ],
      },
    },

    // ...availableVehiclesPipelineStages,
    // {
    //   $sort: {
    //     registration: -1,
    //   },
    // },
  ]);
  // console.log('result', result);

  const { vehicles, meta } = result[0];
  console.log('vehicles', vehicles);
  const searchMeta = meta[0];
  // console.log({ meta, searchMeta });

  const currentPage = pagination?.currentPage || 0;
  return {
    vehicles,
    meta: {
      ...searchMeta,
      page: currentPage + 1,
    },
  };
}

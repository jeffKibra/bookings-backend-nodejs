import { VehicleModel } from '../../models';
//
import {
  generateSearchPipelineStages,
  generateAvailableVehiclesPipelineStages,
} from './utils';
import generateAvailableItemsPipelineStages from './utils/generateAvailableVehiclesPipelineStages';
//
import {
  IVehicle,
  ISearchMeta,
  ISearchVehiclesQueryOptions,
} from '../../../types';
//

export async function getList(orgId: string) {
  if (!orgId) {
    throw new Error('Invalid Params: orgId is required!');
  }

  const vehicles = await VehicleModel.find({
    'metaData.orgId': orgId,
  });

  // console.log({ vehicles });

  return vehicles;
}

export async function search(
  orgId: string,
  query: string | number,
  options?: ISearchVehiclesQueryOptions
) {
  const pagination = options?.pagination;
  console.log('pagination', pagination);
  const limit = pagination?.limit;

  const searchPipelineStages = generateSearchPipelineStages(orgId, query, {
    paginationLastDoc: pagination?.lastDoc,
  });
  const availableVehiclesPipelineStages = generateAvailableItemsPipelineStages(
    orgId,
    options?.selectedDates || []
  );

  // aggregation to fetch items not booked.
  const result = await VehicleModel.aggregate<{
    vehicles: IVehicle[];
    meta: ISearchMeta[];
  }>([
    ...searchPipelineStages,
    {
      $facet: {
        /**
         * if some methods in facetPipeline not possible,
         * unwind vehicles and use later in the main pipeline
         */
        vehicles: [
          ...availableVehiclesPipelineStages,
          {
            $limit: typeof limit === 'number' && limit > 0 ? limit : 10,
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

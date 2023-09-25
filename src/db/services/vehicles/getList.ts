import { VehicleModel } from '../../models';
//
import {
  generateSearchPipelineStages,
  generateAvailableVehiclesPipelineStages,
} from './utils';
import generateAvailableItemsPipelineStages from './utils/generateAvailableVehiclesPipelineStages';
//
import { IVehicle, ISearchMeta } from '../../../types';
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
  selectedDates?: string[]
) {
  const searchPipelineStages = generateSearchPipelineStages(orgId, query);
  const availableVehiclesPipelineStages = generateAvailableItemsPipelineStages(
    orgId,
    selectedDates
  );

  // aggregation to fetch items not booked.
  const result = await VehicleModel.aggregate<{
    vehicles: IVehicle[];
    meta: ISearchMeta[];
  }>([
    ...searchPipelineStages,
    {
      $facet: {
        vehicles: [...availableVehiclesPipelineStages],
        meta: [
          {
            $replaceWith: '$$SEARCH_META',
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

  const { vehicles, meta } = result[0];
  // console.log('vehicles', vehicles);
  const searchMeta = meta[0];
  // console.log({ meta, searchMeta });

  // 'vehicle._id': vehicleId,
  //       'metaData.orgId': orgId,
  //       selectedDates: { $in: [...selectedDates] },
  // console.log({ result });

  return { vehicles, meta: searchMeta };
}

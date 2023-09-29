import { services } from '../../../../db';
//
import { IGQLContext, ISearchVehiclesQueryOptions } from '../../../../types';
//

const queryResolvers = {
  vehicle: async (
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;
    //
    const vehicleId = args?.id;

    const vehicle = await services.vehicles.getById(orgId, vehicleId);
    // console.log({ vehicle });

    return vehicle;
  },
  vehicles: async (
    parent: unknown,
    args: unknown,
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;

    const vehicles = await services.vehicles.getList(orgId);

    // console.log('vehicles: ', vehicles);

    return vehicles;
  },
  searchVehicles(
    parent: unknown,
    args: {
      query: string | number;
      queryOptions?: ISearchVehiclesQueryOptions;
    },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    //
    const query = args?.query || '';
    const options = args?.queryOptions;
    console.log('options', options);

    return services.vehicles.search(orgId, query, options);
  },
  // searchAvailableVehicles(
  //   parent: unknown,
  //   args: { query: string | number; selectedDates?: string[] },
  //   context: Required<IGQLContext>
  // ) {
  //   const orgId = context.orgId;
  //   //
  //   const query = args?.query || '';
  //   const selectedDates = args?.selectedDates || [];

  //   return services.vehicles.search(orgId, {
  //     query,
  //     selectedDates,
  //   });
  // },
};

export default queryResolvers;

import { services } from '../../../../db';
//
import { IGQLContext } from '../../../../types';

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

    const vehicles = services.vehicles.getList(orgId);

    // console.log('vehicles: ', vehicles);

    return vehicles;
  },
};

export default queryResolvers;

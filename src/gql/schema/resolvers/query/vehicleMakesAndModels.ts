import { services } from '../../../../db';
//
import { IGQLContext } from '../../../../types';
//

const queryResolvers = {
  vehicleMakes: async (
    parent: unknown,
    args: unknown,
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;

    const vehicleMakes = await services.vehicles.makes.list(orgId);

    // console.log('vehicles: ', vehicles);

    return vehicleMakes;
  },

  vehicleMake: async (
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;
    //
    const makeId = args?.id;

    const vehicle = await services.vehicles.makes.one(orgId, makeId).get();
    // console.log({ vehicle });

    return vehicle;
  },

  vehicleModel(
    parent: unknown,
    args: {
      makeId: string;
      id: string;
    },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    //
    const makeId = args?.makeId || '';
    const modelId = args?.id || '';
    console.log({ modelId, makeId });

    return services.vehicles.makes.one(orgId, makeId).models.get(modelId);
  },
};

export default queryResolvers;

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
    // const orgId = context.orgId;

    const vehicleMakes = await services.vehicles.makes.list();

    console.log('vehicle makes: ', vehicleMakes);

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

    const vehicleMake = await services.vehicles.makes.one(orgId, makeId).get();
    // console.log({ vehicle });

    return vehicleMake;
  },

  async vehicleModel(
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

    const model = await services.vehicles.makes
      .one(orgId, makeId)
      .models.get(modelId);

    return model;
  },
};

export default queryResolvers;

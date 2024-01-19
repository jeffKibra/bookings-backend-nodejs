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
    args: { name: string },
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;
    //
    const name = args?.name;

    const vehicleMake = await services.vehicles.makes.get(name);
    // console.log({ vehicle });

    return vehicleMake;
  },

  async vehicleModel(
    parent: unknown,
    args: {
      make: string;
      id: string;
    },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    //
    const make = args?.make || '';
    const modelId = args?.id || '';
    console.log({ modelId, make });

    const model = await services.vehicles.makes
      .models(orgId, make)
      .get(modelId);

    return model;
  },
};

export default queryResolvers;

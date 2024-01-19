import { services } from '../../../../db';
//
import { IGQLContext, IVehicleModelForm } from '../../../../types';

const mutationResolvers = {
  async createVehicleModel(
    parent: unknown,
    args: { formData: IVehicleModelForm },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';
    //
    const make = args?.formData?.make || '';
    const formData = args?.formData;
    console.log({ make, formData, userUID });

    return services.vehicles.makes
      .models(orgId, make)
      .create(userUID, formData);
  },

  async updateVehicleModel(
    parent: unknown,
    args: { id: string; formData: IVehicleModelForm },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //\
    const make = args?.formData?.make || '';

    const modelId = args?.id;
    const formData = args?.formData;

    const updatedVehicleMake = await services.vehicles.makes
      .models(orgId, make)
      .update(userUID, modelId, formData);

    return updatedVehicleMake;
  },

  async deleteVehicleModel(
    parent: unknown,
    args: { make: string; id: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //
    const make = args?.make || '';
    const modelId = args?.id;

    const deleteResult = await services.vehicles.makes
      .models(orgId, make)
      .archive(userUID, modelId);

    console.log({ deleteResult });
  },
};

export default mutationResolvers;

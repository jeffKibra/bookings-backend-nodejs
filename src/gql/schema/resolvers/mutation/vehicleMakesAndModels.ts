import { services } from '../../../../db';
//
import { IGQLContext, IVehicleModelForm } from '../../../../types';

const mutationResolvers = {
  async createVehicleModel(
    parent: unknown,
    args: { makeId: string; formData: IVehicleModelForm },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';
    //
    const makeId = args?.makeId || '';
    const formData = args?.formData;
    console.log({ makeId, formData, userUID });

    return services.vehicles.makes
      .one(orgId, makeId)
      .models.create(userUID, formData);
  },

  async updateVehicleModel(
    parent: unknown,
    args: { makeId: string; id: string; formData: IVehicleModelForm },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //\
    const makeId = args?.makeId;
    const modelId = args?.id;
    const formData = args?.formData;

    const updatedVehicleMake = await services.vehicles.makes
      .one(orgId, makeId)
      .models.update(userUID, modelId, formData);

    return updatedVehicleMake;
  },

  async deleteVehicleModel(
    parent: unknown,
    args: { makeId: string; id: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //
    const makeId = args?.makeId || '';
    const modelId = args?.id;

    const deleteResult = await services.vehicles.makes
      .one(orgId, makeId)
      .models.archive(userUID, modelId);

    console.log({ deleteResult });
  },
};

export default mutationResolvers;

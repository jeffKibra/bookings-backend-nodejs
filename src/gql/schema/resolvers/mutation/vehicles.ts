import { services } from '../../../../db';
//
import { IGQLContext, IVehicleFormData } from '../../../../types';

const mutationResolvers = {
  async createVehicle(
    parent: unknown,
    args: { formData: IVehicleFormData; orgId: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';
    //
    const formData = args?.formData;

    await services.vehicles.create(userUID, orgId, formData);
  },
  async updateVehicle(
    parent: unknown,
    args: { id: string; formData: IVehicleFormData },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //\
    const vehicleId = args?.id;
    const formData = args?.formData;

    const updatedVehicle = await services.vehicles.update(
      userUID,
      orgId,
      vehicleId,
      formData
    );

    return updatedVehicle;
  },
  async deleteVehicle(
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //
    const vehicleId = args?.id;

    const deleteResult = await services.vehicles.archive(
      userUID,
      orgId,
      vehicleId
    );

    console.log({ deleteResult });
  },
};

export default mutationResolvers;

import { services } from '../../../db';
//
import { IGQLContext, IVehicleFormData } from '../../../types';

const mutationResolvers = {
  async createVehicle(
    parent: unknown,
    args: { formData: IVehicleFormData; orgId: string },
    context: Required<IGQLContext>
  ) {
    const formData = args?.formData;
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';

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

    await services.vehicles.update(userUID, orgId, vehicleId, formData);
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

    await services.vehicles.archive(userUID, orgId, vehicleId);
  },
};

export default mutationResolvers;

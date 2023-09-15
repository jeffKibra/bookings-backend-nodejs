import { services } from '../../../db';
//
import { IGQLContext, IVehicleFormData } from '../../../types';

const mutationResolvers = {
  async createVehicle(
    parent: unknown,
    args: { input: IVehicleFormData; orgId: string },
    context: Required<IGQLContext>
  ) {
    const formData = args?.input;
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';

    await services.createVehicle(userUID, orgId, formData);
  },
  async updateVehicle(
    parent: unknown,
    args: { input: IVehicleFormData; orgId: string },
    context: IGQLContext
  ) {
    const formData = args?.input;
    const orgId = args?.orgId;
    const userUID = context.auth?.uid || '';

    await services.createVehicle(userUID, orgId, formData);
  },
  async deleteVehicle(
    parent: unknown,
    args: { input: IVehicleFormData; orgId: string },
    context: IGQLContext
  ) {
    const formData = args?.input;
    const orgId = args?.orgId;
    const userUID = context.auth?.uid || '';

    await services.createVehicle(userUID, orgId, formData);
  },
};

export default mutationResolvers;

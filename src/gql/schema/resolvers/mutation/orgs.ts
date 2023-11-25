import { services } from '../../../../db';
//
import { IGQLContext, IOrgForm } from '../../../../types';

const mutationResolvers = {
  async createOrg(
    parent: unknown,
    args: { formData: IOrgForm; orgId: string },
    context: Required<IGQLContext>
  ) {
    const userUID = context.auth?.uid || '';
    //
    const formData = args?.formData;

    console.log('org form Data', formData);

    // await services.orgs.create(userUID, orgId, formData);
    const createdOrg = await services.orgs.create(userUID, formData);

    return createdOrg;
  },

  async updateOrg(
    parent: unknown,
    args: { id: string; formData: IOrgForm },
    context: Required<IGQLContext>
  ) {
    const userUID = context.auth?.uid || '';
    //\
    const orgId = args?.id;
    const formData = args?.formData;

    // const updatedOrg = await services.orgs.update(
    //   userUID,
    //   orgId,
    //   orgId,
    //   formData
    // );

    // return updatedOrg;
    return null;
  },
  async deleteOrg(
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) {
    const userUID = context.auth?.uid || '';
    //
    const orgId = args?.id;

    // await services.orgs.archive(userUID, orgId, orgId);
  },
};

export default mutationResolvers;

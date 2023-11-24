import { services } from '../../../../db';
//
import { IGQLContext } from '../../../../types';

const queryResolvers = {
  org: async (
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;
    //
    const bookingId = args?.id;

    const vehicle = await services.bookings.getById(orgId, bookingId);
    // console.log({ vehicle });

    return vehicle;
  },
  userOrg: async (
    parent: unknown,
    args: unknown,
    context: Required<IGQLContext>
  ) => {
    const userUID = context.auth?.uid || '';

    const org = await services.orgs.getUserOrg(userUID);

    // console.log('org: ', org);

    return org;
  },
};

export default queryResolvers;

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

    // const vehicle = await services.bookings.getById(orgId, bookingId);
    // console.log({ vehicle });

    // return vehicle;
    return null;
  },
  userOrg: async (
    parent: unknown,
    args: unknown,
    context: Required<IGQLContext>
  ) => {
    const userUID = context.auth?.uid || '';
    // console.log('fetching user org resolver. userUID', userUID);

    const org = await services.orgs.getUserOrg(userUID);

    // console.log('org: ', org);

    return org;
  },
};

export default queryResolvers;

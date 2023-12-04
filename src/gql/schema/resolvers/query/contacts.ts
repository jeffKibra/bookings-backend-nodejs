import { services } from '../../../../db';
//
import { IGQLContext, ISearchContactsQueryOptions } from '../../../../types';
//

const queryResolvers = {
  contact: async (
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;
    //
    const contactId = args?.id;

    const contact = await services.contacts.getById(contactId);
    // console.log({ contact });

    return contact;
  },

  getContactSuggestions(
    parent: unknown,
    args: {
      query: string | number;
      contactGroup: string;
    },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    //
    const query = args?.query || '';
    const contactGroup = args?.contactGroup || '';
    console.log('search contacts group', contactGroup);

    return services.contacts.autoComplete(orgId, query, contactGroup);
  },

  searchContacts(
    parent: unknown,
    args: {
      query: string | number;
      queryOptions?: ISearchContactsQueryOptions;
    },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    //
    const query = args?.query || '';
    const options = args?.queryOptions;
    console.log('search contacts options', options);

    return services.contacts.search(orgId, query, options);
  },
  // searchAvailableVehicles(
  //   parent: unknown,
  //   args: { query: string | number; selectedDates?: string[] },
  //   context: Required<IGQLContext>
  // ) {
  //   const orgId = context.orgId;
  //   //
  //   const query = args?.query || '';
  //   const selectedDates = args?.selectedDates || [];

  //   return services.contacts.search(orgId, {
  //     query,
  //     selectedDates,
  //   });
  // },
};

export default queryResolvers;

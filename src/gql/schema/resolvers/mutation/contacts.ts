import { services } from '../../../../db';
//
import { IGQLContext, IContactForm, IContactGroup } from '../../../../types';

const mutationResolvers = {
  createContact(
    parent: unknown,
    args: { formData: IContactForm; contactGroup: IContactGroup },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';
    //
    const formData = args?.formData;
    const contactGroup = args?.contactGroup;

    return services.contacts.create(userUID, orgId, formData, contactGroup);
  },

  createCustomer(
    parent: unknown,
    args: { formData: IContactForm; contactGroup: IContactGroup },
    context: Required<IGQLContext>
  ) {
    console.log('creating customer');
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';
    //
    const formData = args?.formData;

    return services.contacts.create(userUID, orgId, formData, 'customer');
  },

  async updateContact(
    parent: unknown,
    args: { id: string; formData: IContactForm },
    context: Required<IGQLContext>
  ) {
    console.log('updating contact');
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //\
    const contactId = args?.id;
    const formData = args?.formData;

    const updatedContact = await services.contacts.update(
      userUID,
      orgId,
      contactId,
      formData
    );

    return updatedContact;
  },

  async deleteContact(
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //
    const contactId = args?.id;

    const deleteResult = await services.contacts.delete(
      userUID,
      orgId,
      contactId
    );

    console.log({ deleteResult });
  },
};

export default mutationResolvers;

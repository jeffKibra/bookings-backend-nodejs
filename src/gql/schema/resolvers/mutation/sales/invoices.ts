import { services } from '../../../../../db';
//
import { IGQLContext, IInvoiceForm } from '../../../../../types';

const mutationResolvers = {
  async createInvoice(
    parent: unknown,
    args: { formData: IInvoiceForm; orgId: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';
    //
    const formData = args?.formData;

    console.log('booking form Data', formData);

    // await services.bookings.create(userUID, orgId, formData);
    await services.sales.invoices.create(userUID, orgId, formData);
  },

  async updateInvoice(
    parent: unknown,
    args: { id: string; formData: IInvoiceForm },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //\
    const bookingId = args?.id;
    const formData = args?.formData;

    const updatedInvoice = await services.sales.invoices.update(
      userUID,
      orgId,
      bookingId,
      formData
    );

    return updatedInvoice;
  },
  async deleteInvoice(
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //
    const bookingId = args?.id;

    await services.sales.invoices.archive(userUID, orgId, bookingId);
  },
};

export default mutationResolvers;

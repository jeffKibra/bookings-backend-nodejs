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

    console.log('invoice form Data', formData);

    // await services.invoices.create(userUID, orgId, formData);
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
    const invoiceId = args?.id;
    const formData = args?.formData;

    const updatedInvoice = await services.sales.invoices.update(
      userUID,
      orgId,
      invoiceId,
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
    const invoiceId = args?.id;
    // console.log('delete invoice resolver', { orgId, userUID, invoiceId });

    await services.sales.invoices.archive(userUID, orgId, invoiceId);
  },
};

export default mutationResolvers;

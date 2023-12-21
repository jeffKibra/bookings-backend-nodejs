import { services } from '../../../../../db';
//
import { IGQLContext, IPaymentReceivedForm } from '../../../../../types';

const mutationResolvers = {
  async createPaymentReceived(
    parent: unknown,
    args: { formData: IPaymentReceivedForm; orgId: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';
    //
    const formData = args?.formData;

    console.log('paymentReceived form Data', formData);

    // await services.paymentsReceived.create(userUID, orgId, formData);
    await services.sales.paymentsReceived.create(userUID, orgId, formData);
  },

  async updatePaymentReceived(
    parent: unknown,
    args: { id: string; formData: IPaymentReceivedForm },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //\
    const paymentReceivedId = args?.id;
    const formData = args?.formData;

    const updatedInvoice = await services.sales.paymentsReceived.update(
      userUID,
      orgId,
      paymentReceivedId,
      formData
    );

    return updatedInvoice;
  },
  async deletePaymentReceived(
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //
    const paymentReceivedId = args?.id;
    // console.log('delete paymentReceived resolver', { orgId, userUID, paymentReceivedId });

    await services.sales.paymentsReceived.archive(
      userUID,
      orgId,
      paymentReceivedId
    );
  },
};

export default mutationResolvers;

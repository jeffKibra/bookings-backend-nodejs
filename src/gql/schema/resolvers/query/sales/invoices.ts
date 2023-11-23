import { services } from '../../../../../db';
//
import { IGQLContext, IInvoicesQueryOptions } from '../../../../../types';

const queryResolvers = {
  invoice: async (
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;
    //
    const invoiceId = args?.id;
    console.log({ invoiceId });

    const invoice = await services.sales.invoices.getById(orgId, '', invoiceId);
    console.log({ invoice });

    return invoice;
  },

  invoices(
    parent: unknown,
    args: {
      options?: IInvoicesQueryOptions;
    },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    //
    const options = args?.options;
    console.log('search invoices options', options);

    return services.sales.invoices.list(orgId, options);
  },
};

export default queryResolvers;

import { services } from '../../../../../db';
//
import {
  IGQLContext,
  IPaymentsReceivedQueryOptions,
} from '../../../../../types';

const queryResolvers = {
  paymentReceived: async (
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;
    //
    const paymentReceivedId = args?.id;
    console.log({ paymentReceivedId });

    const paymentReceived = await services.sales.paymentsReceived.getById(
      orgId,
      paymentReceivedId
    );
    console.log({ paymentReceived });

    return paymentReceived;
  },

  paymentsReceived(
    parent: unknown,
    args: {
      options?: IPaymentsReceivedQueryOptions;
    },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    // console.log({ orgId });
    //
    const options = args?.options;
    console.log('list paymentsReceived options', options);

    return services.sales.paymentsReceived.list(orgId, options);
  },
};

export default queryResolvers;

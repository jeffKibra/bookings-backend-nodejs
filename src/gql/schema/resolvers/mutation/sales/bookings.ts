import { services } from '../../../../../db';
//
import { IGQLContext, IBookingForm } from '../../../../../types';

const mutationResolvers = {
  async createBooking(
    parent: unknown,
    args: { formData: IBookingForm; orgId: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    const userUID = context.auth?.uid || '';
    //
    const formData = args?.formData;

    console.log('booking form Data', formData);

    // await services.bookings.create(userUID, orgId, formData);
    await services.sales.bookings.create(userUID, orgId, formData);
  },

  async updateBooking(
    parent: unknown,
    args: { id: string; formData: IBookingForm },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //\
    const bookingId = args?.id;
    const formData = args?.formData;

    const updatedBooking = await services.sales.bookings.update(
      userUID,
      orgId,
      bookingId,
      formData
    );

    return updatedBooking;
  },
  async deleteBooking(
    parent: unknown,
    args: { id: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context?.orgId;
    const userUID = context.auth?.uid || '';
    //
    const bookingId = args?.id;

    await services.sales.bookings.archive(userUID, orgId, bookingId);
  },
};

export default mutationResolvers;

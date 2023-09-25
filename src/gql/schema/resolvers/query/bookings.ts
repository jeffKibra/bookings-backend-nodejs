import { services } from '../../../../db';
//
import { IGQLContext } from '../../../../types';

const queryResolvers = {
  booking: async (
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
  bookings: async (
    parent: unknown,
    args: unknown,
    context: Required<IGQLContext>
  ) => {
    const orgId = context.orgId;

    const bookings = await services.bookings.getList(orgId);

    // console.log('bookings: ', bookings);

    return bookings;
  },

  async findBookingWithAtleastOneOfTheSelectedDates(
    parent: unknown,
    args: { dates: string[]; vehicleId: string },
    context: Required<IGQLContext>
  ) {
    const orgId = context.orgId;
    //
    const argsIsValid = args && typeof args === 'object';
    if (!argsIsValid) {
      throw new Error('Invalid arguments received!');
    }

    const { dates, vehicleId } = args;

    const bookings =
      await services.bookings.findVehicleBookingWithAtleastOneOfTheSelectedDates(
        orgId,
        vehicleId,
        dates
      );

    // console.log('bookings: ', bookings);

    return bookings;
  },
};

export default queryResolvers;

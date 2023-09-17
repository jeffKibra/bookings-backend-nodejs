//
import vehiclesResolvers from './vehicles';
import bookingsResolvers from './bookings';

const mutationResolvers = {
  ...vehiclesResolvers,
  ...bookingsResolvers,
};

export default mutationResolvers;

import bookingsResolvers from './bookings';
import vehiclesResolvers from './vehicles';

const queryResolvers = {
  ...vehiclesResolvers,
  ...bookingsResolvers,
};

export default queryResolvers;

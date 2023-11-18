import bookingsResolvers from './bookings';
import invoicesResolvers from './invoices';

const salesResolvers = {
  ...bookingsResolvers,
  ...invoicesResolvers,
};

export default salesResolvers;

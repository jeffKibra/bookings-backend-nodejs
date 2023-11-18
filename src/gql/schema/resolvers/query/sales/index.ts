import bookingsResolvers from './bookings';
import invoicesResolvers from './invoices';

const salesQueryResolvers = {
  ...bookingsResolvers,
  ...invoicesResolvers,
};

export default salesQueryResolvers;

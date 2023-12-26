import bookingsResolvers from './bookings';
import invoicesResolvers from './invoices';
import paymentsReceivedResolvers from './paymentsReceived';

const salesResolvers = {
  ...bookingsResolvers,
  ...invoicesResolvers,
  ...paymentsReceivedResolvers,
};

export default salesResolvers;

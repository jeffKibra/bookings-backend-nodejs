import bookingsResolvers from './bookings';
import invoicesResolvers from './invoices';
import paymentsReceivedResolvers from './paymentsReceived';

const salesQueryResolvers = {
  ...bookingsResolvers,
  ...invoicesResolvers,
  ...paymentsReceivedResolvers,
};

export default salesQueryResolvers;

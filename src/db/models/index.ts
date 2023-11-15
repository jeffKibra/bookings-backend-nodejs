import { model } from 'mongoose';

//
import {
  ContactSchema,
  BookingSchema,
  VehicleSchema,
  ItemYearlyBookingsSchema,
  JournalEntrySchema,
  InvoiceSchema,
  AccountSchema,
  PaymentReceivedSchema,
  OrgSchema,
} from './schemas';
//

export const OrgModel = model('Organization', OrgSchema);

export const ContactModel = model('Contact', ContactSchema);

export const VehicleModel = model('Vehicle', VehicleSchema);
//Run per model to init indexes for unique fields-run only once
// VehicleModel.init().then()
export const BookingModel = model('Booking', BookingSchema);

export const JournalEntryModel = model('Journal_Entry', JournalEntrySchema);

export const InvoiceModel = model('Invoice', InvoiceSchema);

export const PaymentReceivedModel = model(
  'Payments_Received',
  PaymentReceivedSchema
);

export const AccountModel = model('Accounts', AccountSchema);

export const ItemYearlyBookings = model(
  'Item_Yearly_Bookings',
  ItemYearlyBookingsSchema
);

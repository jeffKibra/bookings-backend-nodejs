import { model } from 'mongoose';

//
import {
  BookingSchema,
  VehicleSchema,
  ItemYearlyBookingsSchema,
  JournalEntrySchema,
} from './schemas';
//

export const VehicleModel = model('Vehicle', VehicleSchema);
//Run per model to init indexes for unique fields-run only once
// VehicleModel.init().then()
export const BookingModel = model('Booking', BookingSchema);

export const JournalEntryModel = model('JournalEntry', JournalEntrySchema);

export const ItemYearlyBookings = model(
  'Item_Yearly_Bookings',
  ItemYearlyBookingsSchema
);

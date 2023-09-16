import { model } from 'mongoose';

//
import { BookingSchema, VehicleSchema } from './schemas';
//

export const VehicleModel = model('Vehicle', VehicleSchema);
export const BookingModel = model('Booking', BookingSchema);

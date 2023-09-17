import { model } from 'mongoose';

//
import { BookingSchema, VehicleSchema } from './schemas';
//

export const VehicleModel = model('Vehicle', VehicleSchema);
//Run per model to init indexes for unique fields-run only once
// VehicleModel.init().then()
export const BookingModel = model('Booking', BookingSchema);

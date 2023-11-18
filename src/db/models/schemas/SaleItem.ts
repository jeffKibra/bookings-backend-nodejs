import { Schema } from 'mongoose';

//
import { AccountSummarySchema } from './Account';
import { VehicleModelSchema, VehicleSchemaForBookingForm } from './Vehicle';
//

const SaleItemDetailsSchema = new Schema({
  // _id: { type: String, required: true },
  //   salesAccount: { type: AccountSummarySchema, required: true },
  units: String,
  taxType: String,
});
//
export const SaleItemSchema = new Schema({
  // _id is automatically added to the schema
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  qty: { type: Number, required: true },
  total: { type: Number, required: true },
  description: String,
  salesAccountId: { type: String, required: true },
  // details: { type: SaleItemDetailsSchema, required: true },
  details: SaleItemDetailsSchema,
  vehicle: VehicleSchemaForBookingForm,
});

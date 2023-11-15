import { Schema } from 'mongoose';
//

import {
  metaDataSchema,
  paymentModeSchema,
  paymentTermSchema,
} from './Generals';
import { customerSummarySchema } from './Customer';
import { VehicleSchemaForBookingForm } from './Vehicle';
//
import { initSchema } from './utils';
//\

const paymentMetaDataSchema = new Schema({
  ...metaDataSchema.obj,
  transactionType: { type: String },
});

const downPaymentSchema = new Schema({
  amount: { type: Number, required: true },
  paymentMode: { type: paymentModeSchema, required: true },
  reference: { type: String, default: '' },
});

const paymentsSchema = new Schema({
  paymentTerm: { type: paymentTermSchema },
  count: { type: Number },
  amounts: { type: Object },
});

const PaidBookingSchema = new Schema({
  _id: { type: String, required: true },
  amount: { type: Number },
});

const schema = new Schema({
  //formdata
  vehicle: { type: VehicleSchemaForBookingForm, required: true },
  customer: { type: customerSummarySchema, required: true },
  amount: { type: Number, required: true },
  paidBookings: { type: [PaidBookingSchema], required: true },
  excess: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMode: { type: paymentModeSchema, required: true },
  reference: { type: String, default: '' },
  //extras
  balance: { type: Number, required: true },
  payments: { type: paymentsSchema },
  metaData: { type: paymentMetaDataSchema },
});

// schema.pre('find', function () {
//   this.where({ 'metaData.status': 0 });
// });
// schema.pre('findOne', function () {
//   this.where({ 'metaData.status': 0 });
// });
// schema.pre('findOneAndUpdate', function () {
//   this.where({ 'metaData.status': 0 });
// });
initSchema(schema);

export default schema;

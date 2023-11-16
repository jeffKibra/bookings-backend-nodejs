import { Schema } from 'mongoose';
//

import {
  metaDataFields,
  paymentModeSchema,
  paymentTermSchema,
} from './Generals';
import { ContactSummarySchema } from './Contact';
import { VehicleSchemaForBookingForm } from './Vehicle';
//
import { initSchema } from './utils';
//\

const BookingMetaDataSchema = new Schema({
  ...metaDataFields,
  transactionType: { type: String, required: true },
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

const schema = new Schema({
  //formdata
  vehicle: { type: VehicleSchemaForBookingForm, required: true },
  customer: { type: ContactSummarySchema, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  selectedDates: { type: [String], required: true },
  bookingRate: { type: Number, required: true },
  bookingTotal: { type: Number, required: true },
  transferFee: { type: Number, required: true },
  subTotal: { type: Number, required: true },
  total: { type: Number, required: true },
  customerNotes: { type: Number, default: '' },
  downPayment: { type: downPaymentSchema, required: true },
  //extras
  balance: { type: Number, required: true },
  payments: { type: paymentsSchema },
  metaData: BookingMetaDataSchema,
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

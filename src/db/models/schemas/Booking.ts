import { Schema } from 'mongoose';
//

import {
  metaDataSchema,
  paymentModeSchema,
  paymentTermSchema,
} from './Generals';
import VehicleSchema from './Vehicle';
import { customerSummarySchema } from './Customer';
//\

const bookingMetaDataSchema = new Schema({
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

const schema = new Schema({
  //formdata
  vehicle: VehicleSchema,
  customer: { type: customerSummarySchema, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  selectedDates: { type: [String], required: true },
  bookingRate: { type: Number, required: true },
  bookingTotal: { type: Number, required: true },
  transferAmount: { type: Number, required: true },
  subTotal: { type: Number, required: true },
  total: { type: Number, required: true },
  customerNotes: { type: Number, default: '' },
  downPayment: { type: downPaymentSchema, required: true },
  //extras
  balance: { type: Number, required: true },
  payments: { type: paymentsSchema },
  metaData: { type: bookingMetaDataSchema },
});

export default schema;

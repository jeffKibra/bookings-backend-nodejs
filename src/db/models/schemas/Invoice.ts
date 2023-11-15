import { Schema } from 'mongoose';
//

import {
  metaDataSchema,
  paymentModeSchema,
  paymentTermSchema,
} from './Generals';
import { customerSummarySchema } from './Customer';
import { SaleItemSchema } from './SaleItem';
//
import { initSchema } from './utils';
//\

const InvoiceMetaDataSchema = metaDataSchema.discriminator("InvoiceMetaData", new Schema({
  ...metaDataSchema.obj,
  transactionType: { type: String },
  saleType: { type: String, required: true },
}));


const downPaymentSchema = new Schema({
  amount: { type: Schema.Types.Decimal128, required: true },
  paymentMode: { type: paymentModeSchema, required: true },
  reference: { type: String, default: '' },
});

const schema = new Schema({
  //formdata
  customer: { type: customerSummarySchema, required: true },
  items: { type: [SaleItemSchema], required: true },
  saleDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  //
  // taxes:{type:[], required: true},
  taxType: { type: String },
  totalTax: { type: Schema.Types.Decimal128 },
  subTotal: { type: Schema.Types.Decimal128, required: true },
  total: { type: Schema.Types.Decimal128, required: true },
  //
  downPayment: { type: downPaymentSchema },
  //
  customerNotes: { type: String, default: '' },
  paymentTerm: { type: paymentTermSchema, required: true },
  //extras
  // balance: { type: Schema.Types.Decimal128, required: true },
  // payments: { type: paymentsSchema },
  metaData: { type: InvoiceMetaDataSchema },
  //
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

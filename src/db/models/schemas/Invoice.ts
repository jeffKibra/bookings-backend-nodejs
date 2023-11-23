import { Schema } from 'mongoose';
//

import {
  metaDataFields,
  paymentModeSchema,
  paymentTermSchema,
} from './Generals';
import { ContactSummarySchema } from './Contact';
import { SaleItemSchema } from './SaleItem';
//
import { initSchema } from './utils';
//\

const InvoiceMetaData = new Schema({
  ...metaDataFields,
  transactionType: { type: String, required: true },
  saleType: { type: String, required: true },
});

const downPaymentSchema = new Schema({
  amount: { type: Schema.Types.Decimal128, required: true },
  paymentMode: { type: paymentModeSchema, required: true },
  reference: { type: String, default: '' },
});

const schema = new Schema({
  //formdata
  customer: { type: ContactSummarySchema, required: true },
  items: { type: [SaleItemSchema], required: true },
  saleDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  //
  // taxes:{type:[], required: true},
  taxType: { type: String, required: true },
  totalTax: { type: Schema.Types.Decimal128, required: true },
  subTotal: { type: Schema.Types.Decimal128, required: true },
  total: { type: Schema.Types.Decimal128, required: true },
  //
  // downPayment: { type: downPaymentSchema },
  //
  customerNotes: { type: String, default: '' },
  paymentTerm: { type: paymentTermSchema, required: true },
  //extras
  // balance: { type: Schema.Types.Decimal128, required: true },
  // payments: { type: paymentsSchema },
  metaData: { type: InvoiceMetaData, required: true },
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

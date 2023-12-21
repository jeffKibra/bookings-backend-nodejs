import { Schema } from 'mongoose';
//

import { metaDataFields } from './Generals';
import { PaymentModeSummarySchema } from './PaymentMode';
import { ContactSummarySchema } from './Contact';
import { AccountSummarySchema } from './Account';
//
import { initSchema } from './utils';
//\

const PaymentMetaDataSchema = new Schema({
  ...metaDataFields,
  transactionType: { type: String, required: true },
});

const PaidInvoiceSchema = new Schema({
  invoiceId: { type: String, required: true },
  amount: { type: Schema.Types.Decimal128, required: true },
  // amount: { type: Number, required: true },
});

const schema = new Schema({
  customer: { type: ContactSummarySchema, required: true },
  amount: { type: Schema.Types.Decimal128, required: true },
  paymentDate: { type: Date, required: true },
  paymentMode: { type: PaymentModeSummarySchema, required: true },
  reference: String,
  paidInvoices: { type: [PaidInvoiceSchema], required: true },
  excess: { type: Schema.Types.Decimal128, required: true },
  account: { type: AccountSummarySchema, required: true },
  //
  metaData: { type: PaymentMetaDataSchema },
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

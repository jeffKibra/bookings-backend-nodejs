import { Schema } from 'mongoose';

//
import { AccountSummarySchema } from './Account';
//

const SaleItemDetailsSchema = new Schema({
  _id: { type: String, required: true },
  //   salesAccount: { type: AccountSummarySchema, required: true },
  units: String,
});
//
export const SaleItemSchema = new Schema({
  // _id is automatically added to the schema
  rate: { type: Number, required: true },
  qty: { type: Number, required: true },
  total: { type: Number, required: true },
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  saleAccountId: { type: String, required: true },
  details: { type: SaleItemDetailsSchema, required: true },
});

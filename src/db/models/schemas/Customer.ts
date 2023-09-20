import { Schema } from 'mongoose';

//
export const customerSummarySchema = new Schema({
  // _id is automatically added to the schema
  _id: { type: String, required: true },
  displayName: { type: String, required: true },
});

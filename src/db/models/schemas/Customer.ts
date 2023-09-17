import { Schema } from 'mongoose';

//
export const customerSummarySchema = new Schema({
  // _id is automatically added to the schema
  displayName: { type: 'string', required: true },
});

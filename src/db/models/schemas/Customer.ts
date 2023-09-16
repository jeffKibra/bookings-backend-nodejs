import { Schema } from 'mongoose';

//
export const customerSummarySchema = new Schema({
  id: { type: 'string', required: true },
  displayName: { type: 'string', required: true },
});

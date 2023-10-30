import { Schema } from 'mongoose';

export const metaDataSchema = new Schema({
  createdBy: { type: String },
  createdAt: { type: Number, default: Date.now() },
  modifiedBy: { type: String },
  modifiedAt: { type: Number, default: Date.now() },
  orgId: { type: String, required: true },
  status: { type: Number, default: 0 },
});

export const paymentTermSchema = new Schema({
  days: { type: Number, required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true },
});

export const paymentModeSchema = new Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

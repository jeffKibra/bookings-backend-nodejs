import { Schema } from 'mongoose';

export const AccountTypeSchema = {
  name: { type: String, required: true },
  id: { type: String, required: true },
  main: { type: String, required: true },
};

export const AccountSummarySchema = {
  name: { type: String, required: true },
  accountId: { type: String, required: true },
  accountType: { type: AccountTypeSchema, required: true },
};

export const metaDataSchema = new Schema({
  createdBy: { type: String },
  createdAt: { type: Date, default: new Date() },
  modifiedBy: { type: String },
  modifiedAt: { type: Date, default: new Date() },
  orgId: { type: String, required: true },
  status: { type: Number, default: 0 },
});

import { Schema } from 'mongoose';

export const orgMetaDataFields = {
  createdBy: { type: String, required: true },
  createdAt: { type: Date, required: true, default: new Date() },
  modifiedBy: { type: String, required: true },
  modifiedAt: { type: Date, required: true, default: new Date() },
  status: { type: Number, required: true, default: 0 },
};

export const metaDataFields = {
  ...orgMetaDataFields,
  orgId: { type: String, required: true },
};

export const MetaDataSchema = new Schema({
  ...metaDataFields,
});

export const AddressSchema = new Schema({
  city: String,
  country: String,
  postalCode: String,
  state: String,
  street: String,
});

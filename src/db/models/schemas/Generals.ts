import { Schema } from 'mongoose';

import { orgMetaDataFields } from './Org';

export const metaDataFields = {
  ...orgMetaDataFields,
  orgId: { type: String, required: true },
};

export const MetaDataSchema = new Schema({
  ...metaDataFields,
});

export const PaymentTermSchema = new Schema({
  days: { type: Number, required: true },
  name: { type: String, required: true },
  value: { type: String, required: true },
});

export const PaymentModeSchema = new Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

export const AddressSchema = new Schema({
  city: String,
  country: String,
  postalCode: String,
  state: String,
  street: String,
});

import { Schema } from 'mongoose';

export const OrgMetaDataSchema = new Schema(
  {
    createdBy: { type: String, required: true },
    createdAt: { type: Date, required: true, default: new Date() },
    modifiedBy: { type: String, required: true },
    modifiedAt: { type: Date, required: true, default: new Date() },
    status: { type: Number, required: true, default: 0 },
  },
  {
    discriminatorKey: 'type',
  }
);

export const metaDataSchema = OrgMetaDataSchema.discriminator(
  'GeneralMetaDataSchema',
  new Schema(
    {
      orgId: { type: String, required: true },
    },
    {
      discriminatorKey: 'type',
    }
  )
);

export const paymentTermSchema = new Schema({
  days: { type: Number, required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true },
});

export const paymentModeSchema = new Schema({
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

import { Schema } from 'mongoose';
//
import { metaDataSchema } from './Generals';

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

export const AccountMetaDataSchema = metaDataSchema.discriminator(
  'AccountMetaData',
  new Schema({}, { discriminatorKey: 'type' })
);

const schema = new Schema({
  ...AccountSummarySchema,
  description: String,
  tags: { type: [String], required: true },
  metaData: { type: AccountMetaDataSchema, required: true },
});

export default schema;

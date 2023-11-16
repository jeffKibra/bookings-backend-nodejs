import { Schema } from 'mongoose';
//
import { metaDataFields } from './Generals';

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

export const AccountMetaDataSchema = new Schema({ ...metaDataFields });

const schema = new Schema({
  ...AccountSummarySchema,
  description: String,
  tags: { type: [String], required: true },
  metaData: { type: AccountMetaDataSchema, required: true },
});

export default schema;

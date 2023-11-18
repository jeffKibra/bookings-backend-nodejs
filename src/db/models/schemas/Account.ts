import { Schema } from 'mongoose';
//
import { metaDataFields } from './Generals';

export const AccountTypeSchema = {
  name: { type: String, required: true },
  id: { type: String, required: true },
  main: { type: String, required: true },
};

const accountSummaryFields = {
  name: { type: String, required: true },
  accountId: { type: String, required: true },
  accountType: { type: AccountTypeSchema, required: true },
};

export const AccountSummarySchema = new Schema({
  ...accountSummaryFields,
});

export const AccountMetaDataSchema = new Schema({ ...metaDataFields });

const schema = new Schema({
  ...accountSummaryFields,
  description: String,
  tags: { type: [String], required: true },
  metaData: { type: AccountMetaDataSchema, required: true },
});

export default schema;

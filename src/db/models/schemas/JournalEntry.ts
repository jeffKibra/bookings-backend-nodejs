import { Schema } from 'mongoose';
//
import { metaDataSchema } from './Generals';
import { AccountSummarySchema } from './Account';
//
import { initSchema } from './utils';
//

const MetaDataSchema = new Schema({
  ...metaDataSchema.obj,
  transactionType: { type: String },
});

const ContactSummary = new Schema({
  _id: { type: String, required: true },
  displayName: { type: String, required: true },
});

const schema = new Schema({
  amount: { type: Number, required: true },
  entryType: { type: String, required: true },
  account: { type: AccountSummarySchema, required: true },
  contacts: { type: [ContactSummary] },
  transactionType: String,
  transactionId: { type: String, required: true },
  metaData: { type: MetaDataSchema },
});

initSchema(schema);

export default schema;

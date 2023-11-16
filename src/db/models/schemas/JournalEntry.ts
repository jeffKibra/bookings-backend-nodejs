import { Schema } from 'mongoose';
//
import { metaDataFields } from './Generals';
import { AccountSummarySchema } from './Account';
import { ContactSummarySchema } from './Contact';
//
import { initSchema } from './utils';
//

const JournalEntryMetaDataSchema = new Schema({
  ...metaDataFields,
  transactionType: { type: String, required: true },
});

const schema = new Schema({
  amount: { type: Number, required: true },
  entryType: { type: String, required: true },
  account: { type: AccountSummarySchema, required: true },
  contacts: { type: [ContactSummarySchema] },
  transactionType: String,
  transactionId: { type: String, required: true },
  metaData: { type: JournalEntryMetaDataSchema },
});

initSchema(schema);

export default schema;

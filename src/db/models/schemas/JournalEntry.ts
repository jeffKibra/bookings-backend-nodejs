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

const JournalEntryTransactionTypeSchema = new Schema({
  primary: { type: String, required: true },
  secondary: { type: String, default: '' },
});

const schema = new Schema({
  amount: { type: Schema.Types.Decimal128, required: true },
  entryType: { type: String, required: true },
  account: { type: AccountSummarySchema, required: true },
  contact: { type: ContactSummarySchema },
  transactionType: { type: String, required: true },
  transactionId: { type: JournalEntryTransactionTypeSchema, required: true },
  metaData: { type: JournalEntryMetaDataSchema },
});

initSchema(schema);

export default schema;

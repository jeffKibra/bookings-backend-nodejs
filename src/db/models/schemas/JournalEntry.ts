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
});

const LastProcessedValue = new Schema({
  org: { type: Schema.Types.Decimal128, default: 0 },
  contact: { type: Schema.Types.Decimal128, default: 0 },
});

const schema = new Schema({
  transactionId: { type: String, required: true },
  entryId: { type: String, default: '' },
  //
  amount: { type: Schema.Types.Decimal128, required: true },
  entryType: { type: String, required: true },
  account: { type: AccountSummarySchema, required: true },
  contact: { type: ContactSummarySchema },
  lastProcessedValue: {
    type: LastProcessedValue,
  },
  transactionType: { type: String, required: true },
  metaData: { type: JournalEntryMetaDataSchema },
  // transactionType: String,
});

initSchema(schema);

export default schema;

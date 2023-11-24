import { Schema } from 'mongoose';
//
import { orgMetaDataFields } from './Generals';

import { initSchema } from './utils';

const PaymentModeMetaDataSchema = new Schema({ ...orgMetaDataFields });

const schema = new Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  metaData: { type: PaymentModeMetaDataSchema, required: true },
});

initSchema(schema);

export default schema;

import { Schema } from 'mongoose';
//
import { orgMetaDataFields } from './Generals';
import { initSchema } from './utils';

const PaymentTermMetaDataSchema = new Schema({ ...orgMetaDataFields });

const schema = new Schema({
  days: { type: Number, required: true },
  name: { type: String, required: true },
  value: { type: String, required: true },
  metaData: { type: PaymentTermMetaDataSchema, required: true },
});

initSchema(schema);

export default schema;

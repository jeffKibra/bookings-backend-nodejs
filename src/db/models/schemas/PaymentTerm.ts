import { Schema } from 'mongoose';
//
import { orgMetaDataFields } from './Generals';
import { initSchema } from './utils';

const PaymentTermMetaDataSchema = new Schema({ ...orgMetaDataFields });

const paymentTermFields = {
  days: { type: Number, required: true },
  name: { type: String, required: true },
};

export const PaymentTermSummarySchema = new Schema({
  ...paymentTermFields,
});

const schema = new Schema({
  ...paymentTermFields,
  value: { type: String, default: '' },
  metaData: { type: PaymentTermMetaDataSchema, required: true },
});

initSchema(schema);

export default schema;

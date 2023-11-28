import { Schema } from 'mongoose';
//
import { orgMetaDataFields } from './Generals';

import { initSchema } from './utils';

const PaymentModeMetaDataSchema = new Schema({ ...orgMetaDataFields });

const paymentModeFields = {
  name: { type: String, required: true },
};

export const PaymentModeSummarySchema = new Schema({
  ...paymentModeFields,
});

const schema = new Schema({
  ...paymentModeFields,
  value: { type: String, default: '' },
  metaData: { type: PaymentModeMetaDataSchema, required: true },
});

initSchema(schema);

export default schema;

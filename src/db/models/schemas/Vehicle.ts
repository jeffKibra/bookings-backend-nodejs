import { Schema } from 'mongoose';

//
import { metaDataSchema } from './Generals';

const schema = new Schema({
  registration: { type: String, required: true, unique: true },
  color: { type: String, required: true },
  description: { type: String },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  type: { type: String, required: true },
  rate: { type: Number, required: true },
  sku: { type: String, required: true, unique: true },
  metaData: metaDataSchema,
});

export default schema;

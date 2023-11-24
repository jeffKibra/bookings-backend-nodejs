import { Schema } from 'mongoose';
//
import { initSchema } from './utils';

const schema = new Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

initSchema(schema);

export default schema;

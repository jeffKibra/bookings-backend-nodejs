import { Schema } from 'mongoose';
//

import { orgMetaDataFields } from './Org';

//
import { initSchema } from './utils';
//\

const TaxMetaDataSchema = new Schema({ ...orgMetaDataFields });

const schema = new Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  metaData: { type: TaxMetaDataSchema, required: true },
});

initSchema(schema);

export default schema;

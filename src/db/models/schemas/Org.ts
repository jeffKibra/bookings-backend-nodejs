import { Schema } from 'mongoose';
//

import { AddressSchema, orgMetaDataFields } from './Generals';
import TaxSchema from './Tax';

//
import { initSchema } from './utils';
//

const OrgMetaDataSchema = new Schema({
  ...orgMetaDataFields,
});

const BusinessTypeSchema = new Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

const schema = new Schema({
  name: { type: String, required: true },
  businessType: { type: BusinessTypeSchema, required: true },
  address: { type: AddressSchema, required: true },
  industry: { type: String, required: true },
  phone: { type: String, required: true },
  website: { type: String, required: true },
  //
  taxes: { type: TaxSchema },
  //
  metaData: { type: OrgMetaDataSchema, required: true },
});

initSchema(schema);

export default schema;

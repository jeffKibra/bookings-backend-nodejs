import { Schema } from 'mongoose';
//

import { AddressSchema, OrgMetaDataSchema } from './Generals';

//
import { initSchema } from './utils';
//\

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
  metaData: { type: OrgMetaDataSchema, required: true },

  //
});

// schema.pre('find', function () {
//   this.where({ 'metaData.status': 0 });
// });
// schema.pre('findOne', function () {
//   this.where({ 'metaData.status': 0 });
// });
// schema.pre('findOneAndUpdate', function () {
//   this.where({ 'metaData.status': 0 });
// });
initSchema(schema);

export default schema;

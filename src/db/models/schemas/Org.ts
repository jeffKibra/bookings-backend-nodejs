import { Schema } from 'mongoose';
//

import AddressSchema from './Address';
import PaymentModeSchema from './PaymentMode';
import PaymentTermSchema from './PaymentTerm';
import TaxSchema from './Tax';

//
import { initSchema } from './utils';
//

export const orgMetaDataFields = {
  createdBy: { type: String, required: true },
  createdAt: { type: Date, required: true, default: new Date() },
  modifiedBy: { type: String, required: true },
  modifiedAt: { type: Date, required: true, default: new Date() },
  status: { type: Number, required: true, default: 0 },
};

export const OrgMetaDataSchema = new Schema({
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
  paymentTerms: { type: [PaymentTermSchema], required: true },
  paymentModes: { type: [PaymentModeSchema], required: true },
  //
  metaData: { type: OrgMetaDataSchema, required: true },
});

initSchema(schema);

export default schema;

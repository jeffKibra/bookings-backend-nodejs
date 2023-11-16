import { Schema } from 'mongoose';
//
import { paymentTermSchema, metaDataFields, AddressSchema } from './Generals';

//
const ContactMetaDataSchema = new Schema({
  ...metaDataFields,
  contactType: { type: String, required: true },
});

export const ContactSummarySchema = new Schema({
  // _id is automatically added to the schema
  _id: { type: String, required: true },
  displayName: { type: String, required: true },
});

const schema = new Schema({
  salutation: String,
  firstName: String,
  lastName: String,
  companyName: String,
  displayName: { type: String, required: true },
  email: String,
  mobile: String,
  phone: String,
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  website: String,
  remarks: String,
  // type: 'individual' | 'company',
  type: String,
  //
  paymentTerm: paymentTermSchema,
  openingBalance: Schema.Types.Decimal128,
  //
  metaData: ContactMetaDataSchema,
});

export default schema;

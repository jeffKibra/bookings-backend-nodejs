import { Schema } from 'mongoose';
//
import { metaDataFields, AddressSchema } from './Generals';
import { PaymentTermSummarySchema } from './PaymentTerm';

//
const ContactMetaDataSchema = new Schema({
  ...metaDataFields,
  group: { type: String, required: true },
});

export const ContactSummarySchema = new Schema({
  // _id is automatically added to the schema
  _id: { type: String, required: true },
  displayName: { type: String, required: true },
});

const schema = new Schema({
  type: { type: String, required: true },
  salutation: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  companyName: String,
  displayName: { type: String, required: true },
  email: String,
  phone: String,
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  website: String,
  remarks: String,
  //
  paymentTerm: { type: PaymentTermSummarySchema, required: true },
  openingBalance: { type: Schema.Types.Decimal128, required: true },
  //
  metaData: { type: ContactMetaDataSchema, required: true },
});

export default schema;

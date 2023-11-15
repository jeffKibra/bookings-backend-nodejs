import { Schema } from 'mongoose';
//
import { paymentTermSchema, metaDataSchema } from './Generals';

//
const ContactMetaData = metaDataSchema.discriminator(
  'ContactMetaData',
  new Schema({
    contactType: { type: String, required: true },
  })
);

export const ContactSummarySchema = new Schema({
  // _id is automatically added to the schema
  _id: { type: String, required: true },
  displayName: { type: String, required: true },
});

export const ContactAddress = new Schema({
  city: String,
  country: String,
  postalCode: String,
  state: String,
  street: String,
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
  billingAddress: ContactAddress,
  shippingAddress: ContactAddress,
  website: String,
  remarks: String,
  // type: 'individual' | 'company',
  type: String,
  //
  paymentTerm: paymentTermSchema,
  openingBalance: Schema.Types.Decimal128,
  //
  metaData: { type: ContactMetaData, required: true },
});

export default schema;

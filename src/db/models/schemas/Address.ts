import { Schema } from 'mongoose';

const schema = new Schema({
  city: String,
  country: String,
  postalCode: String,
  state: String,
  street: String,
});

export default schema;

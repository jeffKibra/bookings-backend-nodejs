import { Schema } from 'mongoose';

//
import { metaDataSchema } from './Generals';

const VehicleSchemaSharedFields = {
  color: { type: String, required: true },
  description: { type: String },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  type: { type: String, required: true },
  rate: { type: Number, required: true },
};

export const VehicleSchemaForBookingForm = new Schema({
  //_id is automatically added to schema
  ...VehicleSchemaSharedFields,
  registration: { type: String, required: true },
  sku: { type: String, required: true },
});

const schema = new Schema({
  ...VehicleSchemaSharedFields,
  registration: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  metaData: metaDataSchema,
});

export default schema;

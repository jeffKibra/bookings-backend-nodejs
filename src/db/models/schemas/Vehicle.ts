import { Schema } from 'mongoose';

//
import { initSchema } from './utils';
//
import { metaDataSchema } from './Generals';

const VehicleModelSchema = new Schema({
  model: { type: String, required: true },
  type: { type: String, required: true },
  make: { type: String, required: true },
});

const VehicleSchemaSharedFields = {
  color: { type: String, required: true },
  description: { type: String },
  make: { type: String, required: true },
  model: { type: VehicleModelSchema, required: true },
  year: { type: Number },
  // type: { type: String, required: true },
  rate: { type: Number, required: true },
};

export const VehicleSchemaForBookingForm = new Schema({
  //_id is automatically added to schema
  ...VehicleSchemaSharedFields,
  _id: { type: String, required: true },
  registration: { type: String, required: true },
  sku: { type: String, required: true },
});

const schema = new Schema({
  ...VehicleSchemaSharedFields,
  registration: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  metaData: metaDataSchema,
});

initSchema(schema);

export default schema;

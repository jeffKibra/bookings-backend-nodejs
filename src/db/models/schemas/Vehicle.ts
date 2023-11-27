import { Schema } from 'mongoose';

//
import { initSchema } from './utils';
//
import { metaDataFields } from './Generals';

const VehicleMetaDataSchema = new Schema({ ...metaDataFields });

export const VehicleModelSchema = new Schema({
  model: { type: String, required: true },
  type: { type: String, required: true },
  make: { type: String, required: true },
});

export const VehicleSchemaSharedFields = {
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
  // sku: { type: String, required: true },
});

const schema = new Schema({
  ...VehicleSchemaSharedFields,
  registration: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  metaData: { type: VehicleMetaDataSchema, required: true },
});

// schema.index(
//   {
//     registration: 'text',
//     description:"text",
//     color:"text"
//   },
//   { name: 'search vehicles' }
// );

initSchema(schema);

export default schema;

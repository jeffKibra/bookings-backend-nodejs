import { Schema } from 'mongoose';

//
import { initSchema } from './utils';
//
import { metaDataFields } from './Generals';

const VehicleMetaDataSchema = new Schema({ ...metaDataFields });

const vehicleModelFields = {
  name: { type: String, required: true },
  type: { type: String, required: true },
  make: { type: String, required: true },
};

export const VehicleModelSummarySchema = new Schema({
  ...vehicleModelFields,
  year: { type: Number, required: true },
});

const schema = new Schema({
  ...vehicleModelFields,
  years: { type: String, required: true, default: '' },
  metaData: { type: VehicleMetaDataSchema, required: true },
});

initSchema(schema);

export default schema;

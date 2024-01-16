import { Schema } from 'mongoose';

//
import { initSchema } from './utils';
import VehicleModelSchema from './VehicleModel';
//
import { metaDataFields } from './Generals';

const VehicleMakeMetaDataSchema = new Schema({ ...metaDataFields });

const schema = new Schema({
  name: { type: String, required: true },
  models: { type: [VehicleModelSchema], required: true },
  metaData: { type: VehicleMakeMetaDataSchema, required: true },
});

initSchema(schema);

export default schema;

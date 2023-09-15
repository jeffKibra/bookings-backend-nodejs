import { Schema, model } from 'mongoose';

const metaDataSchema = new Schema({
  createdBy: { type: String },
  createdAt: { type: Number },
  modifiedBy: { type: String },
  modifiedAt: { type: Number },
  orgId: { type: String },
});

const schema = new Schema({
  id: { type: String },
  registration: { type: String },
  color: { type: String },
  description: { type: String },
  make: { type: String },
  model: { type: String },
  year: { type: Number },
  type: { type: String },
  rate: { type: Number },
  sku: { type: String },
  status: { type: Number },
  metaData: metaDataSchema,
});

const VehicleModel = model('Vehicle', schema);

export default VehicleModel;

import { Schema } from 'mongoose';

export default function initSchema(schema: Schema) {
  //initialize schema to be retrieving only non-deleted documents
  schema.pre('find', function () {
    this.where({ 'metaData.status': 0 });
  });
  schema.pre('findOne', function () {
    this.where({ 'metaData.status': 0 });
  });
  schema.pre('findOneAndUpdate', function () {
    this.where({ 'metaData.status': 0 });
  });
}

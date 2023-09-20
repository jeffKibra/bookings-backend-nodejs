import { Schema } from 'mongoose';
//

const schema = new Schema({
  itemId: { type: String, required: true },
  year: { type: Number, required: true },
  // month: { type: String, required: true },
  // yearMonth: { type: String, required: true },
  dates: {
    type: [String],
  },
  metaData: {
    type: new Schema({
      modifiedAt: {
        type: Number,
      },
      orgId: { type: String, required: true },
    }),
  },
});

// initSchema(schema);

export default schema;

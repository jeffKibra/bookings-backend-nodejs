import mongoose from 'mongoose';
//

//================================================================

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected...');
});

//================================================================

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected...');
});

//================================================================

export default async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI as string);
    console.log('Connected to mongodb...');
  } catch (error) {
    console.error(error);
  }
}

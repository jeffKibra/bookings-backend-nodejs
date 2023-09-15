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
    const dbURI = process.env.MONGO_DB_URI as string;
    // console.log({ dbURI,  });
    await mongoose.connect(dbURI);
    console.log('Connected to mongodb...');
  } catch (error) {
    console.error(error);
  }
}

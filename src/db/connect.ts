import mongoose from 'mongoose';
//
import { Accounts } from './services/accounts';
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

async function initProjectDB() {
  // console.log('initializing db...');
  // await Accounts.populateDB();
  // console.log('initializing db end');
}

export default async function connect() {
  try {
    const dbURI = process.env.MONGO_DB_URI as string;
    // console.log({ dbURI,  });
    await mongoose.connect(dbURI);
    console.log('Connected to mongodb...');

    await initProjectDB();
  } catch (error) {
    console.error(error);
  }
}

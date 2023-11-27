import mongoose from 'mongoose';
//
import { Accounts } from './services/accounts';
//
import { vehicles } from '../indexes';
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
  // await vehicles.create();
  // console.log('initializing db...');
  // await Accounts.populateDB();
  // console.log('initializing db end');
}

export default async function connect() {
  try {
    const dbURI = process.env.MONGO_DB_URI as string;
    // console.log({ dbURI,  });
    const connection = await mongoose.connect(dbURI);

    // mongoose.Collection.

    await initProjectDB();
  } catch (error) {
    console.error(error);
  }
}

import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import axios from 'axios';
import { request } from 'http';
//
import {
  CONTENT_TYPE,
  DIGEST_AUTH,
  SEARCH_INDEX_API_URL,
  DATABASE_NAME,
} from '../config';

console.log({ DATABASE_NAME, DIGEST_AUTH, SEARCH_INDEX_API_URL });

const COLLECTION_NAME = 'vehicles';

const dbURI = process.env.MONGO_DB_URI as string;

const client = new MongoClient(dbURI);

export default async function create() {
  await client.connect();

  const db = client.db('test');
  const collection = db.collection('vehicles');

  const result = await collection.createSearchIndex({
    name: 'df2',
    definition: {
      //   collectionName: COLLECTION_NAME,
      //   database: DATABASE_NAME,
      //   name: 'default',
      //   type: 'search',
      //   analyzer: 'lucene.standard',
      mappings: {
        dynamic: true,
      },
      //   searchAnalyzer: 'lucene.standard',
    },
  });
  console.log('result:', result);
}

// export default async function create() {
//   const result = await axios.post(
//     SEARCH_INDEX_API_URL,
//     {
//       collectionName: COLLECTION_NAME,
//       database: DATABASE_NAME,
//       name: 'default',
//       type: 'search',
//       analyzer: 'lucene.standard',
//       mappings,
//       searchAnalyzer: 'lucene.standard',
//     },
//     {
//       headers: {
//         'Content-Type': CONTENT_TYPE,
//         Accept: CONTENT_TYPE,
//         digestAuth: DIGEST_AUTH,
//       },
//     }
//   );

//   console.log('result:', result);
// }

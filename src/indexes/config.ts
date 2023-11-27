const PROJECT_ID = process.env.MONGO_DB_PROJECT_ID;
const CLUSTER = process.env.MONGO_DB_CLUSTER;
const PUBLIC_KEY = process.env.MONGO_DB_PUBLIC_KEY;
const PRIVATE_KEY = process.env.MONGO_DB_PRIVATE_KEY;
export const DATABASE_NAME = process.env.MONGO_DB_DATABASE_NAME;

//

const BASE_URL = 'https://cloud.mongodb.com/api/atlas/v2';

const PROJECT_URL = `${BASE_URL}/groups/${PROJECT_ID}`;

const CLUSTER_URL = `${PROJECT_URL}/clusters/${CLUSTER}`;

export const SEARCH_INDEX_API_URL = `${CLUSTER_URL}/fts/indexes`;

export const DIGEST_AUTH = `${PUBLIC_KEY}:${PRIVATE_KEY}`;

export const CONTENT_TYPE = 'application/vnd.atlas.2023-01-01+json';

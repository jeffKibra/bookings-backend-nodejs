import { isAuthenticated } from './utils';

const resolversComposition = {
  'Query.!login': [isAuthenticated()],
};

export default resolversComposition;

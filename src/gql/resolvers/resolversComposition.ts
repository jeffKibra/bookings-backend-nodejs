import { isAuthenticated, checkOrgId } from './utils';

const resolversComposition = {
  'Query.!login': [
    // isAuthenticated(),
    checkOrgId(),
  ],
};

export default resolversComposition;

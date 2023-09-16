import { isAuthenticated, checkOrgId } from './utils';

const mandatory = [
  // isAuthenticated(),
  checkOrgId(),
];

const resolversComposition = {
  'Query.!login': [...mandatory],
  'Mutation.*': [...mandatory],
};

export default resolversComposition;

import { isAuthenticated, checkOrgId } from './utils';

const mandatory = [
  // isAuthenticated(),
  checkOrgId(),
];

// const resolversComposition = {
//   'Query.!login': [...mandatory],
//   'Mutation.*': [...mandatory],
// };

const resolversComposition = {
  'Query.!login': [isAuthenticated()],
  'Query.!userOrg': [checkOrgId()],
  // 'Query.userOrg': [...mandatory],
  'Mutation.*': [isAuthenticated()],
  'Mutation.!createOrg': [checkOrgId()],
};

export default resolversComposition;

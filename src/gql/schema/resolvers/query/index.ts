import salesResolvers from './sales';
import vehiclesResolvers from './vehicles';
import orgsResolvers from './orgs';
import contactsResolvers from './contacts';

const queryResolvers = {
  ...orgsResolvers,
  ...contactsResolvers,
  ...vehiclesResolvers,
  ...salesResolvers,
};

export default queryResolvers;

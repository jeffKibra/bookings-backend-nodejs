//
import contactsResolvers from './contacts';
import vehiclesResolvers from './vehicles';
import salesResolvers from './sales';
import orgsResolvers from './orgs';

const mutationResolvers = {
  ...orgsResolvers,
  ...contactsResolvers,
  ...vehiclesResolvers,
  ...salesResolvers,
};

export default mutationResolvers;

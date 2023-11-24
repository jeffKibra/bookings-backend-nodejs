//
import vehiclesResolvers from './vehicles';
import salesResolvers from './sales';
import orgsResolvers from './orgs';

const mutationResolvers = {
  ...orgsResolvers,
  ...vehiclesResolvers,
  ...salesResolvers,
};

export default mutationResolvers;

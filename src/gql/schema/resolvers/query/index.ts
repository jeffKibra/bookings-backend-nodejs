import salesResolvers from './sales';
import vehiclesResolvers from './vehicles';
import orgsResolvers from './orgs';

const queryResolvers = {
  ...orgsResolvers,
  ...vehiclesResolvers,
  ...salesResolvers,
};

export default queryResolvers;
